#!/usr/bin/env python3
"""
DecodeLabs // Industrial Kit - Project 1: Password Strength Checker
Author: Cybersecurity Analyst
"""

import sys
import math
import hmac
import getpass

# Top 100 most common passwords (source: compiled security databases)
# Used to check for credential stuffing risks.
COMMON_PASSWORDS = [
    "123456", "password", "123456789", "12345678", "12345", "qwerty", 
    "1234567", "1234567890", "1234567890", "admin", "letmein", "welcome", 
    "password123", "oracle", "mysql", "root", "pass123", "secret", "login",
    "graphics", "superman", "monkey", "keyboard", "football", "shadow", 
    "solitude", "master", "access", "corporate", "decodelabs", "security",
    "iloveyou", "mustang", "trustnoone", "joshua", "matrix", "hunter2",
    "dragon", "baseball", "starwars", "princess", "guinness", "charlie",
    "ginger", "bubba", "snickers", "harley", "pepper", "cookie", "shadow",
    "abcdefg", "111111", "123321", "1234567890", "654321", "000000",
    "123123", "777777", "888888", "999999", "admin123", "user123", "guest",
    "test1234", "password123!", "12345678!", "passwords", "changeit",
    "p@ssword", "p@ssw0rd", "P@ssword", "P@ssw0rd", "server", "system",
    "database", "network", "firewall", "router", "gateway", "terminal",
    "root123", "administrator", "support", "service", "backup", "recovery",
    "analyst", "decode", "decrypt", "encrypt", "cipher", "entropy", "shackle",
    "tumbler", "argon2id", "security101", "zero_trust", "cybersecurity"
]

def analyze_password(password: str) -> dict:
    """
    Performs a linear scan analysis on the password, calculates entropy,
    and returns details including the safety classification.
    """
    length = len(password)
    
    # Immediate Fail if less than 8 characters
    if length < 8:
        return {
            "strength": "WEAK",
            "score": 0,
            "entropy": 0.0,
            "length": length,
            "has_upper": any(c.isupper() for c in password),
            "has_lower": any(c.islower() for c in password),
            "has_digit": any(c.isdigit() for c in password),
            "has_symbol": any(not c.isalnum() and ord(c) <= 127 for c in password),
            "has_unicode": any(ord(c) > 127 for c in password),
            "is_leaked": False,
            "remarks": "FAIL: Password length is less than 8 characters (Exponential Brute Force Risk)."
        }

    # Linear Scan Character Detections (optimized built-ins)
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    
    # Identify standard ASCII symbols (decoding range 32-127 excluding alphanumeric)
    has_symbol = any(not c.isalnum() and ord(c) <= 127 for c in password)
    
    # The Unicode Curveball: Detect non-ASCII character usage to expand entropy search space
    has_unicode = any(ord(c) > 127 for c in password)

    # Determine Pool Size (R)
    pool_size = 0
    if has_lower:
        pool_size += 26
    if has_upper:
        pool_size += 26
    if has_digit:
        pool_size += 10
    if has_symbol:
        pool_size += 33
    if has_unicode:
        # Expanding search space to represent the 143,000+ Unicode characters
        pool_size += 143000

    # Calculate Entropy: E = L * log2(R)
    entropy = 0.0
    if pool_size > 0:
        entropy = length * math.log2(pool_size)

    # Constant Time Check for Leaked Passwords to prevent Timing Attacks
    is_leaked = False
    password_bytes = password.encode('utf-8')
    for leaked in COMMON_PASSWORDS:
        leaked_bytes = leaked.encode('utf-8')
        # hmac.compare_digest ensures constant execution time regardless of mismatch location
        if hmac.compare_digest(password_bytes, leaked_bytes):
            is_leaked = True
            # We don't break early in production cryptographic checks to prevent timing leakage,
            # but for this list validation we complete the full list validation or simulate it.
            # To be strictly secure, we check all of them.
            pass

    # Classify Strength
    if is_leaked:
        strength = "WEAK"
        remarks = "FAIL: Password found in DecodeLabs leaked credentials database (Credential Stuffing Risk)."
    else:
        # Score based on entropy bits
        if entropy < 40:
            strength = "WEAK"
            remarks = "WEAK: Low entropy. Password can be easily brute-forced."
        elif entropy < 60:
            strength = "MEDIUM"
            remarks = "MEDIUM: Decent structure, but vulnerable to offline dictionary attacks."
        else:
            # Requires uppercase, digits, and symbols/unicode to be truly strong
            if has_upper and has_digit and (has_symbol or has_unicode):
                strength = "STRONG"
                remarks = "STRONG: High entropy. Resistant to offline brute-force attacks."
            else:
                strength = "MEDIUM"
                remarks = "MEDIUM: High entropy, but lacks character diversity (requires uppercase, numbers, and symbols/Unicode)."

    return {
        "strength": strength,
        "entropy": round(entropy, 2),
        "length": length,
        "has_upper": has_upper,
        "has_lower": has_lower,
        "has_digit": has_digit,
        "has_symbol": has_symbol,
        "has_unicode": has_unicode,
        "is_leaked": is_leaked,
        "remarks": remarks,
        "pool_size": pool_size
    }

def print_result(res: dict):
    print("\n" + "="*50)
    print("      DECODELABS PASSWORD SECURITY METRIC REPORT")
    print("="*50)
    print(f"Password Length: {res['length']} characters")
    print(f"Character Pool (R): {res['pool_size']} symbols")
    print(f"Calculated Entropy: {res['entropy']} bits")
    print(f"Risk Classification: {res['strength']}")
    print("-"*50)
    print(f"Criteria Matrix:")
    print(f"  [x] Lowercase letters" if res['has_lower'] else "  [ ] Lowercase letters")
    print(f"  [x] Uppercase letters" if res['has_upper'] else "  [ ] Uppercase letters")
    print(f"  [x] Numeric Digits" if res['has_digit'] else "  [ ] Numeric Digits")
    print(f"  [x] Special Symbols" if res['has_symbol'] else "  [ ] Special Symbols")
    print(f"  [x] Unicode Expansion" if res['has_unicode'] else "  [ ] Unicode Expansion")
    print(f"  [!] Leaked Database Match: {'YES (VULNERABLE)' if res['is_leaked'] else 'NO (SECURE)'}")
    print("-"*50)
    print(f"Status Remarks:\n{res['remarks']}")
    print("="*50 + "\n")

def run_tests():
    """
    Verifies strength classification correctness.
    """
    print("Running automated validation suite...")
    
    # Test cases
    tests = [
        ("short", "WEAK"),               # Length < 8
        ("12345678", "WEAK"),            # Leaked
        ("password", "WEAK"),            # Leaked
        ("abcdefgh", "WEAK"),            # Low entropy (only lowercase)
        ("Abcdefgh1", "MEDIUM"),          # High entropy, but no symbols
        ("Abcdefgh1!", "STRONG"),        # High entropy with upper, digit, symbol
        ("🔒𝔘𝔫𝔦𝔠𝔬𝔡𝔢1", "STRONG"),         # Unicode character expansion
    ]

    failed = 0
    for pwd, expected in tests:
        res = analyze_password(pwd)
        if res["strength"] != expected:
            print(f"FAIL: Test '{pwd}' got '{res['strength']}', expected '{expected}' (Entropy: {res['entropy']})")
            failed += 1
        else:
            print(f"PASS: Test '{pwd}' matches '{expected}' (Entropy: {res['entropy']} bits, Pool: {res['pool_size']})")
            
    if failed == 0:
        print("\nAll automated validation checks passed successfully!")
        sys.exit(0)
    else:
        print(f"\nValidation failed with {failed} errors.")
        sys.exit(1)

def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == "--test":
            run_tests()
        elif sys.argv[1] == "--password" and len(sys.argv) > 2:
            password = sys.argv[2]
            res = analyze_password(password)
            print_result(res)
            sys.exit(0)
            
    print("DecodeLabs Junior Analyst Shackle Terminal // Password Checker")
    print("------------------------------------------------------------")
    try:
        # Secure getpass to hide prompt text in RAM/screen output
        password = getpass.getpass("Enter password to test: ")
        if not password:
            print("Error: Empty password.")
            sys.exit(1)
        res = analyze_password(password)
        print_result(res)
    except KeyboardInterrupt:
        print("\nTerminal connection interrupted.")
        sys.exit(1)

if __name__ == "__main__":
    main()

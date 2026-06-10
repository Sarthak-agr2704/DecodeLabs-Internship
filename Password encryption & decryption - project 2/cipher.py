#!/usr/bin/env python3
"""
DecodeLabs Cryptographic Engine - Basic Encryption & Decryption (Project 2)
Author: DecodeLabs Cybersecurity Analyst
Description: Implementation of Caesar Cipher showing symmetric mathematical logic,
             handling bounds, edge-cases, and illustrating standard pattern vulnerabilities.
"""

import sys
import argparse

def encrypt(text: str, shift: int) -> str:
    """
    Encrypts plaintext using the Caesar Cipher logic: E_n(x) = (x + n) mod 26
    Preserves character case, spaces, numbers, and punctuation.
    """
    cipher_text = []
    for char in text:
        if 'A' <= char <= 'Z':
            # Shift uppercase letter
            shifted = chr((ord(char) - 65 + shift) % 26 + 65)
            cipher_text.append(shifted)
        elif 'a' <= char <= 'z':
            # Shift lowercase letter
            shifted = chr((ord(char) - 97 + shift) % 26 + 97)
            cipher_text.append(shifted)
        else:
            # Leave punctuation, numbers, and spaces unchanged
            cipher_text.append(char)
    return "".join(cipher_text)

def decrypt(text: str, shift: int) -> str:
    """
    Decrypts ciphertext using the Caesar Cipher symmetric logic: D_n(x) = (x - n) mod 26
    Symmetric encryption utilizes the same shift key but in reverse direction.
    """
    # Decryption is simply shifting in the opposite direction
    return encrypt(text, -shift)

def brute_force(text: str) -> dict:
    """
    Executes a brute-force attack on a Caesar Cipher message by testing all 25 keys.
    Returns a dictionary of shift: decrypted_text
    """
    results = {}
    for shift in range(1, 26):
        results[shift] = decrypt(text, shift)
    return results

def run_self_tests():
    """
    Runs automated validation tests to verify the correctness of the encryption/decryption engine.
    """
    print("[*] Running Cryptographic Engine Self-Tests...")
    
    # Test 1: Standard shifting (+3)
    plaintext_1 = "HELLO WORLD"
    expected_cipher_1 = "KHOOR ZRUOG"
    cipher_1 = encrypt(plaintext_1, 3)
    assert cipher_1 == expected_cipher_1, f"Test 1 Failed: Expected '{expected_cipher_1}', got '{cipher_1}'"
    print("  [✓] Test 1 Passed: Standard Shift (+3) wraps and shifts correctly.")

    # Test 2: Symmetric Decryption
    decrypted_1 = decrypt(cipher_1, 3)
    assert decrypted_1 == plaintext_1, f"Test 2 Failed: Decryption failed. Expected '{plaintext_1}', got '{decrypted_1}'"
    print("  [✓] Test 2 Passed: Symmetric Decryption restores original plaintext.")

    # Test 3: Lowercase and Bounds wrapping (Z -> C, z -> c)
    plaintext_3 = "xyz XYZ"
    expected_cipher_3 = "abc ABC"
    cipher_3 = encrypt(plaintext_3, 3)
    assert cipher_3 == expected_cipher_3, f"Test 3 Failed: Wrap bound failure. Expected '{expected_cipher_3}', got '{cipher_3}'"
    print("  [✓] Test 3 Passed: Lowercase and boundary wrapping (XYZ -> ABC) is successful.")

    # Test 4: Edge Cases (Spaces, punctuation, numbers are unaltered)
    plaintext_4 = "DecodeLabs, 2026! @Secure"
    cipher_4 = encrypt(plaintext_4, 10)
    decrypted_4 = decrypt(cipher_4, 10)
    assert decrypted_4 == plaintext_4, f"Test 4 Failed: Punctuation/Number alteration. Got '{decrypted_4}'"
    # Ensure numbers and symbols weren't shifted
    assert cipher_4.startswith("NomedoLkbi, 2026! @Secob"), f"Test 4 Shift Failed. Got: '{cipher_4}'"
    print("  [✓] Test 4 Passed: Numbers, spaces, and punctuation remain untouched.")

    print("\n[✓] All self-tests passed successfully! The cryptographic logic is verified.")


def display_banner():
    banner = """
============================================================
  DECODELABS CRYPTOGRAPHIC ENGINE - SECURE ENCLAVE CLI
  [Project 2: Basic Encryption & Decryption - Caesar Shift]
============================================================
    """
    print(banner)

def main():
    parser = argparse.ArgumentParser(description="DecodeLabs Caesar Cipher Cryptographic Tool")
    parser.add_argument("-e", "--encrypt", action="store_true", help="Encrypt the provided text")
    parser.add_argument("-d", "--decrypt", action="store_true", help="Decrypt the provided text")
    parser.add_argument("-b", "--brute", action="store_true", help="Brute force all 25 shift combinations")
    parser.add_argument("-t", "--text", type=str, help="Text to process")
    parser.add_argument("-s", "--shift", type=int, help="Shift key (1-25)")
    parser.add_argument("--test", action="store_true", help="Run automated cryptographic self-tests")
    
    args = parser.parse_args()

    if args.test:
        run_self_tests()
        sys.exit(0)

    # CLI Interactive Menu if no arguments provided
    if not (args.encrypt or args.decrypt or args.brute or args.test):
        display_banner()
        while True:
            print("1. Encrypt Plaintext")
            print("2. Decrypt Ciphertext")
            print("3. Brute Force Ciphertext (All Keys)")
            print("4. Run Cryptographic Self-Tests")
            print("5. Exit")
            try:
                choice = input("\nSelect operation [1-5]: ").strip()
                if choice == '5':
                    print("Exiting secure enclave.")
                    break
                elif choice == '4':
                    run_self_tests()
                    print("-" * 60)
                    continue

                if choice not in ['1', '2', '3']:
                    print("[!] Invalid selection.")
                    continue

                text = input("Enter text: ")
                if not text:
                    print("[!] Text cannot be empty.")
                    continue

                if choice in ['1', '2']:
                    try:
                        shift = int(input("Enter Shift Key (1-25): ").strip())
                        if not (1 <= shift <= 25):
                            print("[!] Key must be an integer between 1 and 25.")
                            continue
                    except ValueError:
                        print("[!] Key must be an integer.")
                        continue

                if choice == '1':
                    result = encrypt(text, shift)
                    print(f"\n[+] Plaintext:  {text}")
                    print(f"[+] Shift Key:  {shift}")
                    print(f"[+] Ciphertext: {result}\n")
                elif choice == '2':
                    result = decrypt(text, shift)
                    print(f"\n[+] Ciphertext: {text}")
                    print(f"[+] Shift Key:  {shift}")
                    print(f"[+] Plaintext:  {result}\n")
                elif choice == '3':
                    print(f"\n[*] Brute forcing ciphertext: '{text}'")
                    results = brute_force(text)
                    print("-" * 40)
                    print(f"{'Shift':<6} | {'Decrypted Plaintext'}")
                    print("-" * 40)
                    for key, val in results.items():
                        # Highlighting potential English words (e.g. if 'the ', 'and ', ' of ' is found)
                        flag = ""
                        test_lower = val.lower()
                        if any(word in test_lower for word in [" the ", " and ", " is ", " you ", " this ", " to "]):
                            flag = " [!] Matches English common words"
                        print(f"Shift +{key:02d} | {val}{flag}")
                    print("-" * 40 + "\n")
            except (KeyboardInterrupt, EOFError):
                print("\nExiting secure enclave.")
                break
    else:
        # Batch CLI arguments
        if not args.text and not args.test:
            parser.error("--text is required when running in non-interactive mode.")
            
        if args.encrypt:
            if args.shift is None:
                parser.error("--shift is required for encryption.")
            print(encrypt(args.text, args.shift))
        elif args.decrypt:
            if args.shift is None:
                parser.error("--shift is required for decryption.")
            print(decrypt(args.text, args.shift))
        elif args.brute:
            results = brute_force(args.text)
            for key, val in results.items():
                print(f"Shift +{key:02d}: {val}")

if __name__ == "__main__":
    main()

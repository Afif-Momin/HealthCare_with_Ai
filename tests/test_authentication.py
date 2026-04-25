#!/usr/bin/env python3
"""
Authentication Module Testing
=============================
Tests all authentication endpoints including login, registration, OTP verification.
"""

import requests
import json
from colorama import init, Fore, Style
from tabulate import tabulate

init(autoreset=True)

BASE_URL = "http://localhost:8080/api"

class AuthenticationTester:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def test(self, name, method, endpoint, data=None, expected_status=200):
        """Run a single test"""
        url = f"{BASE_URL}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, timeout=10)
            
            passed = response.status_code == expected_status
            
            if passed:
                self.passed += 1
                status = f"{Fore.GREEN}✓ PASS"
            else:
                self.failed += 1
                status = f"{Fore.RED}✗ FAIL"
            
            try:
                response_data = response.json()
            except:
                response_data = response.text[:100]
            
            self.results.append({
                "test": name,
                "status": status,
                "code": response.status_code,
                "expected": expected_status,
                "response": str(response_data)[:100]
            })
            
            print(f"{status} {name}")
            print(f"   Status: {response.status_code} (Expected: {expected_status})")
            if not passed:
                print(f"   {Fore.RED}Response: {response_data}")
            print()
            
            return response, passed
            
        except Exception as e:
            self.failed += 1
            self.results.append({
                "test": name,
                "status": f"{Fore.RED}✗ ERROR",
                "code": "ERROR",
                "expected": expected_status,
                "response": str(e)[:100]
            })
            print(f"{Fore.RED}✗ ERROR {name}: {str(e)}\n")
            return None, False
    
    def run_tests(self):
        """Run all authentication tests"""
        print(f"\n{Fore.CYAN}{'='*80}")
        print(f"{Fore.CYAN}AUTHENTICATION MODULE TESTING")
        print(f"{Fore.CYAN}{'='*80}\n")
        
        # Test 1: Login with valid credentials (Doctor)
        response, passed = self.test(
            "Login - Valid Doctor Credentials",
            "POST",
            "/auth/login",
            data={
                "email": "doctor@healthcare.com",
                "password": "doctor123"
            }
        )
        
        doctor_token = None
        if passed and response:
            try:
                data = response.json()
                if data.get("success"):
                    doctor_token = data.get("token")
                    print(f"{Fore.GREEN}   Token received: {doctor_token[:50]}...\n")
            except:
                pass
        
        # Test 2: Login with valid credentials (Nurse)
        self.test(
            "Login - Valid Nurse Credentials",
            "POST",
            "/auth/login",
            data={
                "email": "nurse@healthcare.com",
                "password": "nurse123"
            }
        )
        
        # Test 3: Login with valid credentials (Patient)
        self.test(
            "Login - Valid Patient Credentials",
            "POST",
            "/auth/login",
            data={
                "email": "patient@healthcare.com",
                "password": "patient123"
            }
        )
        
        # Test 4: Login with valid credentials (Admin)
        self.test(
            "Login - Valid Admin Credentials",
            "POST",
            "/auth/login",
            data={
                "email": "ismailmansury9737@gmail.com",
                "password": "Ismail@786"
            }
        )
        
        # Test 5: Login with invalid email
        self.test(
            "Login - Invalid Email",
            "POST",
            "/auth/login",
            data={
                "email": "nonexistent@test.com",
                "password": "wrongpassword"
            },
            expected_status=401
        )
        
        # Test 6: Login with wrong password
        self.test(
            "Login - Wrong Password",
            "POST",
            "/auth/login",
            data={
                "email": "doctor@healthcare.com",
                "password": "wrongpassword"
            },
            expected_status=401
        )
        
        # Test 7: Login with missing fields
        self.test(
            "Login - Missing Password",
            "POST",
            "/auth/login",
            data={
                "email": "doctor@healthcare.com"
            },
            expected_status=400
        )
        
        # Test 8: Get profile (Doctor)
        self.test(
            "Get Profile - Doctor",
            "GET",
            "/auth/profile/doctor@healthcare.com"
        )
        
        # Test 9: Get profile (Admin)
        self.test(
            "Get Profile - Admin",
            "GET",
            "/auth/profile/ismailmansury9737@gmail.com"
        )
        
        # Test 10: Get profile (Non-existent user)
        self.test(
            "Get Profile - Non-existent User",
            "GET",
            "/auth/profile/nonexistent@test.com",
            expected_status=404
        )
        
        # Test 11: Get patient ID
        self.test(
            "Get Patient ID by Email",
            "GET",
            "/auth/patient-id/patient@healthcare.com"
        )
        
        # Test 12: Registration (new user)
        import time
        unique_email = f"newuser{int(time.time())}@test.com"
        self.test(
            "Register - New Patient",
            "POST",
            "/auth/register",
            data={
                "fullName": "Test User",
                "email": unique_email,
                "password": "Test@123",
                "phone": "+1-555-1234",
                "role": "PATIENT",
                "dateOfBirth": "1990-01-01",
                "bloodGroup": "O+",
                "address": "123 Test St",
                "gender": "Male"
            }
        )
        
        # Test 13: Registration with existing email
        self.test(
            "Register - Duplicate Email",
            "POST",
            "/auth/register",
            data={
                "fullName": "Duplicate User",
                "email": "doctor@healthcare.com",
                "password": "Test@123",
                "phone": "+1-555-5678",
                "role": "PATIENT"
            },
            expected_status=400
        )
        
        # Test 14: Registration with admin role (should fail)
        self.test(
            "Register - Admin Role (Should Fail)",
            "POST",
            "/auth/register",
            data={
                "fullName": "Admin User",
                "email": f"admin{int(time.time())}@test.com",
                "password": "Test@123",
                "phone": "+1-555-9999",
                "role": "ADMIN"
            },
            expected_status=400
        )
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        print(f"\n{Fore.CYAN}{'='*80}")
        print(f"{Fore.CYAN}TEST REPORT - AUTHENTICATION MODULE")
        print(f"{Fore.CYAN}{'='*80}\n")
        
        total = self.passed + self.failed
        pass_rate = (self.passed / total * 100) if total > 0 else 0
        
        print(f"Total Tests: {total}")
        print(f"{Fore.GREEN}Passed: {self.passed}")
        print(f"{Fore.RED}Failed: {self.failed}")
        print(f"Pass Rate: {pass_rate:.1f}%\n")
        
        # Detailed results table
        table_data = []
        for result in self.results:
            table_data.append([
                result["test"],
                result["status"],
                result["code"],
                result["expected"]
            ])
        
        print(tabulate(table_data, 
                      headers=["Test Name", "Status", "Code", "Expected"],
                      tablefmt="grid"))
        
        # Save to JSON
        with open("test_authentication_report.json", "w") as f:
            json.dump({
                "module": "Authentication",
                "total": total,
                "passed": self.passed,
                "failed": self.failed,
                "pass_rate": pass_rate,
                "results": self.results
            }, f, indent=2)
        
        print(f"\n{Fore.GREEN}Report saved to: test_authentication_report.json")


if __name__ == "__main__":
    tester = AuthenticationTester()
    tester.run_tests()

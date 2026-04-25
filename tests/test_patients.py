#!/usr/bin/env python3
"""
Patients Module Testing
=======================
Tests all patient management endpoints (CRUD operations).
"""

import requests
import json
import time
from colorama import init, Fore
from tabulate import tabulate

init(autoreset=True)

BASE_URL = "http://localhost:8080/api"

class PatientsTester:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
        self.auth_token = None
        self.test_patient_id = None
    
    def login(self):
        """Login to get auth token"""
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={
                    "email": "doctor@healthcare.com",
                    "password": "doctor123"
                },
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.auth_token = data.get("token")
                    print(f"{Fore.GREEN}✓ Authenticated successfully\n")
                    return True
        except Exception as e:
            print(f"{Fore.RED}✗ Authentication failed: {str(e)}\n")
        return False
    
    def test(self, name, method, endpoint, data=None, expected_status=200):
        """Run a single test"""
        url = f"{BASE_URL}{endpoint}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.auth_token}" if self.auth_token else ""
        }
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            
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
        """Run all patient tests"""
        print(f"\n{Fore.CYAN}{'='*80}")
        print(f"{Fore.CYAN}PATIENTS MODULE TESTING")
        print(f"{Fore.CYAN}{'='*80}\n")
        
        # Login first
        if not self.login():
            print(f"{Fore.RED}Cannot proceed without authentication")
            return
        
        # Test 1: Get all patients
        self.test(
            "Get All Patients",
            "GET",
            "/patients"
        )
        
        # Test 2: Search patients
        self.test(
            "Search Patients by Name",
            "GET",
            "/patients?search=John"
        )
        
        # Test 3: Create new patient
        unique_email = f"patient{int(time.time())}@test.com"
        response, passed = self.test(
            "Create New Patient",
            "POST",
            "/patients",
            data={
                "fullName": "Test Patient",
                "email": unique_email,
                "phoneNumber": "+1-555-TEST",
                "dateOfBirth": "1990-05-15",
                "gender": "MALE",
                "bloodGroup": "O_POSITIVE",
                "address": "123 Test Street, Test City",
                "emergencyContactName": "Emergency Contact",
                "emergencyContactPhone": "+1-555-EMER"
            },
            expected_status=201
        )
        
        # Store patient ID for further tests
        if passed and response:
            try:
                self.test_patient_id = response.json().get("id")
                print(f"{Fore.GREEN}   Created patient ID: {self.test_patient_id}\n")
            except:
                pass
        
        # Test 4: Create patient with duplicate email
        self.test(
            "Create Patient - Duplicate Email",
            "POST",
            "/patients",
            data={
                "fullName": "Duplicate Patient",
                "email": unique_email,
                "phoneNumber": "+1-555-DUP",
                "dateOfBirth": "1990-05-15",
                "gender": "MALE",
                "bloodGroup": "O_POSITIVE",
                "address": "456 Duplicate St"
            },
            expected_status=400
        )
        
        # Test 5: Create patient with missing required fields
        self.test(
            "Create Patient - Missing Required Fields",
            "POST",
            "/patients",
            data={
                "fullName": "Incomplete Patient"
            },
            expected_status=400
        )
        
        # Test 6: Get patient by ID
        if self.test_patient_id:
            self.test(
                "Get Patient by ID",
                "GET",
                f"/patients/{self.test_patient_id}"
            )
        
        # Test 7: Get non-existent patient
        self.test(
            "Get Non-existent Patient",
            "GET",
            "/patients/999999",
            expected_status=404
        )
        
        # Test 8: Update patient
        if self.test_patient_id:
            self.test(
                "Update Patient",
                "PUT",
                f"/patients/{self.test_patient_id}",
                data={
                    "fullName": "Updated Test Patient",
                    "phoneNumber": "+1-555-UPDT",
                    "address": "789 Updated Avenue"
                }
            )
        
        # Test 9: Update non-existent patient
        self.test(
            "Update Non-existent Patient",
            "PUT",
            "/patients/999999",
            data={
                "fullName": "Non-existent"
            },
            expected_status=404
        )
        
        # Test 10: Delete patient (optional - comment out if you want to keep test data)
        # if self.test_patient_id:
        #     self.test(
        #         "Delete Patient",
        #         "DELETE",
        #         f"/patients/{self.test_patient_id}",
        #         expected_status=204
        #     )
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        print(f"\n{Fore.CYAN}{'='*80}")
        print(f"{Fore.CYAN}TEST REPORT - PATIENTS MODULE")
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
        with open("test_patients_report.json", "w") as f:
            json.dump({
                "module": "Patients",
                "total": total,
                "passed": self.passed,
                "failed": self.failed,
                "pass_rate": pass_rate,
                "results": self.results
            }, f, indent=2)
        
        print(f"\n{Fore.GREEN}Report saved to: test_patients_report.json")


if __name__ == "__main__":
    tester = PatientsTester()
    tester.run_tests()

import sys
import httpx
import hmac
import hashlib
import json
import time
from colorama import init, Fore, Style

init(autoreset=True)

class ConformanceSuite:
    def __init__(self, target_url: str):
        self.target_url = target_url.rstrip("/")
        self.client = httpx.Client(base_url=self.target_url, timeout=5.0)
        
        self.tests_passed = 0
        self.tests_failed = 0
        self.warnings = 0
        self.results = []
        
    def log(self, test_name: str, status: str, message: str = ""):
        if status == "PASS":
            self.tests_passed += 1
            print(f"{Fore.GREEN}[PASS] {test_name}{Style.RESET_ALL} {message}")
        elif status == "FAIL":
            self.tests_failed += 1
            print(f"{Fore.RED}[FAIL] {test_name}{Style.RESET_ALL} {message}")
        elif status == "WARN":
            self.warnings += 1
            print(f"{Fore.YELLOW}[WARN] {test_name}{Style.RESET_ALL} {message}")
            
        self.results.append({
            "test": test_name,
            "status": status,
            "message": message
        })

    def run_all(self):
        print(f"\n{Fore.CYAN}=== Starting QPS/1.0 Conformance Suite ==={Style.RESET_ALL}\nTarget: {self.target_url}\n")
        
        self.test_17_unsupported_version()
        self.test_16_malformed_messages()
        self.test_04_invalid_state_transitions()
        
        # We need to run a valid path to get the session ID and challenge
        hs = self.test_valid_path()
        if hs:
            self.test_12_replay_attempt(hs)
            self.test_10_invalid_auth_proof(hs)
            # Cannot easily test 11 (Expired challenge) without sleeping for minutes unless TTL is mocked, so we issue a WARN
            self.log("11. Expired challenge", "WARN", "Cannot test TTL expiration synchronously without blocking.")
            self.test_14_session_expiration(hs)
            self.test_15_session_termination()
        else:
            self.log("12. Replay attempt", "FAIL", "Blocked by valid path failure")
            self.log("10. Invalid authentication proof", "FAIL", "Blocked by valid path failure")
            self.log("11. Expired challenge", "FAIL", "Blocked by valid path failure")
            self.log("14. Session expiration", "FAIL", "Blocked by valid path failure")
            self.log("15. Session termination", "FAIL", "Blocked by valid path failure")

        self.test_19_error_code_compliance()
        self.test_07_qber_rejection_behavior()
        self.test_06_key_establishment_failure()
        self.test_18_unknown_message_type()
        
        self.generate_report()

    def request(self, method: str, endpoint: str, payload: dict = None, headers: dict = None):
        h = {"Content-Type": "application/json"}
        if headers:
            h.update(headers)
        return self.client.request(method, endpoint, json=payload, headers=h)

    # --- Test Implementations ---

    def test_17_unsupported_version(self):
        res = self.request("POST", "/api/v1/protocol/handshake", {
            "client_id": "test",
            "username": "alice",
            "requested_version": "999.0",
            "supported_algorithms": ["bb84"]
        })
        # Note: The reference implementation might not actually check requested_version strictly yet.
        data = res.json()
        
        if res.status_code >= 400 and data.get("payload", {}).get("error_code") == "QPS-1001":
            self.log("1. Version negotiation", "PASS")
            self.log("17. Unsupported protocol version", "PASS")
        else:
            self.log("1. Version negotiation", "FAIL", f"Expected QPS-1001, got {data}")
            self.log("17. Unsupported protocol version", "FAIL", "Server ignored invalid version")

    def test_16_malformed_messages(self):
        res = self.request("POST", "/api/v1/protocol/handshake", {"invalid": "data"})
        if res.status_code >= 400:
            data = res.json()
            if data.get("payload", {}).get("error_code") == "QPS-1000":
                self.log("16. Malformed messages", "PASS")
            else:
                self.log("16. Malformed messages", "FAIL", f"Expected QPS-1000, got {data}")
        else:
            self.log("16. Malformed messages", "FAIL", "Server accepted malformed data")

    def test_04_invalid_state_transitions(self):
        res = self.request("POST", "/api/v1/protocol/authenticate", {
            "client_id": "test",
            "session_id": "invalid_or_missing",
            "proof": {"mock": "data"} # Bypass string validation error to test logic
        })
        data = res.json()
        
        # Should be an invalid state because session doesn't exist
        if data.get("payload", {}).get("error_code") == "QPS-1100":
            self.log("4. Invalid state transitions", "PASS")
        else:
            self.log("4. Invalid state transitions", "FAIL", f"Expected QPS-1100 for auth without handshake, got {data}")

    def test_valid_path(self):
        # First do a strict test for 20. Sensitive Data Leakage without simulate header
        res_strict = self.request("POST", "/api/v1/protocol/handshake", {
            "client_id": "conformance",
            "username": "alice",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        })
        strict_payload = res_strict.json().get("payload", {})
        if strict_payload.get("simulation_details", {}).get("final_hex_key"):
            self.log("20. Sensitive-data leakage", "FAIL", "CRITICAL VIOLATION: final_hex_key was exposed in strict handshake response")
        else:
            self.log("20. Sensitive-data leakage", "PASS")

        # Now do a simulated handshake to get the key for the remaining valid path tests
        res = self.request("POST", "/api/v1/protocol/handshake", {
            "client_id": "conformance",
            "username": "alice",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        }, headers={"X-Qinert-Simulate": "true"})
        
        if res.status_code != 200:
            self.log("2. Protocol initiation", "FAIL", "Handshake failed")
            return None
            
        data = res.json()
        payload = data.get("payload", {})
        
        self.log("2. Protocol initiation", "PASS")
        self.log("5. Key-establishment success", "PASS")
        
        if payload.get("challenge_nonce"):
            self.log("8. Challenge generation", "PASS")
        else:
            self.log("8. Challenge generation", "FAIL", "No nonce provided")
            
        sim_details = payload.get("simulation_details", {})
        secret = sim_details.get("final_hex_key")
        
        if not secret:
            self.log("9. Valid authentication proof", "FAIL", "Cannot proceed to test auth without simulate key")
            return None
            
        if not payload.get("challenge_nonce"):
            self.log("9. Valid authentication proof", "FAIL", "Cannot test because challenge_nonce is missing")
            self.log("3. Valid state transitions", "FAIL", "Blocked by missing nonce")
            self.log("13. Session establishment", "FAIL", "Blocked by missing nonce")
            return None

        # To proceed with tests, we use the leaked key (even though it's a violation)
        mac = hmac.new(bytes.fromhex(secret), payload["challenge_nonce"].encode(), digestmod=hashlib.sha256)
        proof = mac.hexdigest()
        
        auth_res = self.request("POST", "/api/v1/protocol/authenticate", {
            "session_id": payload["session_id"],
            "proof": proof
        })
        
        if auth_res.status_code == 200:
            self.log("3. Valid state transitions", "PASS")
            self.log("9. Valid authentication proof", "PASS")
            self.log("13. Session establishment", "PASS")
        else:
            self.log("9. Valid authentication proof", "FAIL", f"Failed with {auth_res.json()}")
            
        # Return state for further tests
        return {
            "session_id": payload["session_id"],
            "token": auth_res.json().get("payload", {}).get("session_token"),
            "secret": secret,
            "nonce": payload["challenge_nonce"]
        }

    def test_12_replay_attempt(self, state):
        # Submit the EXACT SAME proof again
        mac = hmac.new(bytes.fromhex(state["secret"]), state["nonce"].encode(), digestmod=hashlib.sha256)
        proof = mac.hexdigest()
        
        auth_res = self.request("POST", "/api/v1/protocol/authenticate", {
            "session_id": state["session_id"],
            "proof": proof
        })
        
        data = auth_res.json()
        if data.get("payload", {}).get("error_code") == "QPS-3002":
            self.log("12. Replay attempt", "PASS")
        else:
            self.log("12. Replay attempt", "FAIL", f"Expected QPS-3002 for replay, got {data}")

    def test_10_invalid_auth_proof(self, state):
        # Submit WRONG proof for this session
        auth_res = self.request("POST", "/api/v1/protocol/authenticate", {
            "session_id": state["session_id"],
            "proof": "00000000000000000000000000000000"
        })
        
        data = auth_res.json()
        # Might also be QPS-1100 or QPS-3002 if session was consumed. Let's start a fresh one for accuracy.
        fresh = self.request("POST", "/api/v1/protocol/handshake", {
            "client_id": "bad_auth",
            "username": "alice",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        }).json()
        
        bad_auth_res = self.request("POST", "/api/v1/protocol/authenticate", {
            "session_id": fresh["payload"]["session_id"],
            "proof": "0000000000000000000000000000000000000000000000000000000000000000"
        }).json()
        
        if bad_auth_res.get("payload", {}).get("error_code") == "QPS-3000":
            self.log("10. Invalid authentication proof", "PASS")
        else:
            self.log("10. Invalid authentication proof", "FAIL", f"Expected QPS-3000, got {bad_auth_res}")

    def test_14_session_expiration(self, state):
        self.log("14. Session expiration", "WARN", "Cannot synchronously test TTL expiration.")

    def test_15_session_termination(self):
        res = self.request("POST", "/api/v1/session/terminate") # Guessing endpoint
        if res.status_code == 404:
            self.log("15. Session termination", "FAIL", "No termination endpoint found")
        else:
            self.log("15. Session termination", "WARN", "Server has termination endpoint but untested semantics")

    def test_19_error_code_compliance(self):
        # We've verified this implicitly in other tests, but let's do a direct bad payload
        res = self.request("POST", "/api/v1/protocol/handshake", {"client_id": 123})
        data = res.json()
        err_code = data.get("payload", {}).get("error_code", "")
        if str(err_code).startswith("QPS-"):
            self.log("19. Error-code compliance", "PASS")
        else:
            self.log("19. Error-code compliance", "FAIL", f"Expected QPS-XXXX format, got {data}")

    def test_07_qber_rejection_behavior(self):
        self.log("7. QBER rejection behavior", "WARN", "No public interface exists to explicitly inject optical noise")

    def test_06_key_establishment_failure(self):
        # Sending unsupported algorithm should fail key establishment cleanly
        res = self.request("POST", "/api/v1/protocol/handshake", {
            "client_id": "test",
            "username": "alice",
            "requested_version": "1.0.0",
            "supported_algorithms": ["unsupported_quantum_magic"]
        })
        if res.status_code >= 400 and res.json().get("payload", {}).get("error_code") == "QPS-2000":
            self.log("6. Key-establishment failure", "PASS")
        else:
            self.log("6. Key-establishment failure", "FAIL", f"Expected QPS-2000, got {res.json()}")

    def test_18_unknown_message_type(self):
        res = self.request("POST", "/api/v1/protocol/unknown_message", {})
        if res.status_code == 404:
            self.log("18. Unknown message type", "PASS", "Rejected via 404")
        else:
            self.log("18. Unknown message type", "FAIL", f"Unexpected response: {res.status_code}")

    def generate_report(self):
        total = self.tests_passed + self.tests_failed
        percentage = (self.tests_passed / total * 100) if total > 0 else 0
        
        if self.tests_failed == 0 and self.warnings == 0:
            classification = "CONFORMANT"
        elif self.tests_failed > 0:
            classification = "NON-CONFORMANT"
        else:
            classification = "PARTIALLY CONFORMANT"

        report = {
            "QPS Version": "1.0",
            "Server": self.target_url,
            "Tests Passed": self.tests_passed,
            "Tests Failed": self.tests_failed,
            "Warnings": self.warnings,
            "Compliance Percentage": f"{percentage:.1f}%",
            "Final Classification": classification,
            "Results": self.results
        }
        
        with open("conformance_report.json", "w") as f:
            json.dump(report, f, indent=2)

        print(f"\n{Fore.CYAN}=== Conformance Report ==={Style.RESET_ALL}")
        print(f"Server: {self.target_url}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_failed}")
        print(f"Warnings: {self.warnings}")
        print(f"Compliance: {percentage:.1f}%")
        
        if classification == "CONFORMANT":
            print(f"Classification: {Fore.GREEN}{classification}{Style.RESET_ALL}")
        elif classification == "NON-CONFORMANT":
            print(f"Classification: {Fore.RED}{classification}{Style.RESET_ALL}")
        else:
            print(f"Classification: {Fore.YELLOW}{classification}{Style.RESET_ALL}")
            
        print("\nReport written to conformance_report.json")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    suite = ConformanceSuite(url)
    suite.run_all()

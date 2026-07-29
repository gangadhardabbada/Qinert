from qinert import QinertClient, QinertError

def main():
    try:
        with QinertClient(base_url="http://localhost:8000") as qinert:
            print("1. Initiating Handshake...")
            hs = qinert.handshake(client_id="python_demo")
            print(f"✅ Handshake complete. Challenge: {hs.payload.challenge_nonce}")

            print("\n2. Authenticating via HMAC Proof...")
            auth = qinert.authenticate()
            print(f"✅ Authentication successful. JWT: {auth.payload.session_token}")

            # Session is automatically terminated at the end of the `with` block
            
    except QinertError as e:
        print(f"❌ Protocol Error: {e}")

if __name__ == "__main__":
    main()

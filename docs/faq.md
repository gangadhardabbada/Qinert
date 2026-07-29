# Frequently Asked Questions (FAQ)

### Is Qinert actually secure against Quantum Computers?
Yes and no. The *concept* of BB84 demonstrated by Qinert is Information-Theoretically Secure, meaning it is immune to any computational attack, including Shor's algorithm on a quantum computer. However, Qinert is an educational software implementation; it does not utilize physical quantum networks (fiber optics or free-space lasers) between the client and server.

### Why does Qiskit Aer show > 0% QBER?
If you select the "Noise" mode in the Experimental Lab, the Qiskit Aer engine injects simulated measurement and depolarization errors into the circuit. This mimics the decoherence seen in real hardware.

### Why does the IBM Quantum Engine take so long?
The IBM hardware engine compiles your BB84 circuit down to the hardware's native ISA and submits it to a cloud queue. Depending on global traffic to IBM Quantum services, your job may sit in a queue for several seconds or minutes before executing on the physical QPU.

### Can I run the Experimental Lab without an IBM Token?
Yes! The Classical Simulator and Qiskit Aer Simulator run entirely locally on your machine and require no external APIs or tokens. You only need an IBM token if you explicitly select the "IBM Quantum" engine.

### What is the difference between Noise and Eavesdropping?
To the receiver (Bob/Server), they look identical: both manifest as elevated QBER. This is a fundamental principle of QKD; you must assume all errors are caused by an eavesdropper. If the error rate exceeds the threshold (11%), the key must be aborted, regardless of whether it was caused by Eve or a noisy channel.

 let currentStep = 1;

    function goToStep(step) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen' + step).classList.add('active');

        // Update dots
        ['dot1','dot2','dot3'].forEach((id, i) => {
            const dot = document.getElementById(id);
            dot.classList.remove('active','done');
            if (i + 1 < step) dot.classList.add('done');
            else if (i + 1 === step) dot.classList.add('active');
        });

        // Update left panel steps
        [1,2,3].forEach(n => {
            const el = document.getElementById('left-step-' + n);
            el.classList.remove('active');
            if (n === step) el.classList.add('active');
        });

        currentStep = step;
    }

    function goToStep2() {
        const email = document.getElementById('resetEmail').value.trim();
        if (!email || !email.includes('@')) {
            document.getElementById('resetEmail').focus();
            document.getElementById('resetEmail').style.borderColor = '#EF4444';
            setTimeout(() => document.getElementById('resetEmail').style.borderColor = '', 1500);
            return;
        }
        // Update subtitle with email
        document.getElementById('otpSubtitle').innerHTML = `We sent a 6-digit code to <strong>${email}</strong>. Check your inbox.`;
        goToStep(2);
        initOtp();
    }

    function goToStep3() {
        const inputs = document.querySelectorAll('.otp-input');
        const code = [...inputs].map(i => i.value).join('');
        if (code.length < 6) {
            inputs.forEach(i => { i.style.borderColor = '#EF4444'; setTimeout(() => i.style.borderColor = '', 1500); });
            return;
        }
        goToStep(3);
    }

    function goToSuccess() {
        const pwd = document.getElementById('newPwd').value;
        const confirm = document.getElementById('confirmPwd').value;
        if (pwd.length < 8) {
            document.getElementById('newPwd').focus();
            return;
        }
        if (pwd !== confirm) {
            document.getElementById('confirmPwd').style.borderColor = '#EF4444';
            setTimeout(() => document.getElementById('confirmPwd').style.borderColor = '', 1500);
            return;
        }
        // Show success (hide dots + left steps update)
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen4').classList.add('active');
        document.querySelector('.step-indicator').style.display = 'none';
        ['dot1','dot2','dot3'].forEach(id => {
            document.getElementById(id).classList.remove('active');
            document.getElementById(id).classList.add('done');
        });
    }

    // ── OTP Logic ──
    function initOtp() {
        const inputs = document.querySelectorAll('.otp-input');
        inputs.forEach((inp, idx) => {
            inp.value = '';
            inp.classList.remove('filled');
            inp.addEventListener('input', () => {
                inp.value = inp.value.replace(/\D/g, '');
                if (inp.value) {
                    inp.classList.add('filled');
                    if (idx < inputs.length - 1) inputs[idx + 1].focus();
                } else {
                    inp.classList.remove('filled');
                }
            });
            inp.addEventListener('keydown', e => {
                if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
            });
            inp.addEventListener('paste', e => {
                e.preventDefault();
                const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
                inputs.forEach((i, n) => {
                    i.value = pasted[n] || '';
                    if (i.value) i.classList.add('filled'); else i.classList.remove('filled');
                });
                if (pasted.length > 0) inputs[Math.min(pasted.length, inputs.length - 1)].focus();
            });
        });
        setTimeout(() => inputs[0].focus(), 100);
    }

    // ── Resend timer ──
    let resendTimer;
    function startResendTimer() {
        const btn = document.getElementById('resendBtn');
        const label = document.getElementById('timerLabel');
        btn.style.display = 'none';
        label.style.display = 'inline';
        let secs = 30;
        label.textContent = `Resend in ${secs}s`;
        clearInterval(resendTimer);
        resendTimer = setInterval(() => {
            secs--;
            label.textContent = `Resend in ${secs}s`;
            if (secs <= 0) {
                clearInterval(resendTimer);
                label.style.display = 'none';
                btn.style.display = 'inline';
            }
        }, 1000);
    }

    // ── Password toggle ──
    function toggleEye(inputId, btn) {
        const input = document.getElementById(inputId);
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        btn.style.color = isHidden ? 'var(--green)' : '';
    }

    // ── Password strength ──
    function checkStrength(val) {
        const segs = [document.getElementById('seg1'), document.getElementById('seg2'), document.getElementById('seg3'), document.getElementById('seg4')];
        const label = document.getElementById('strengthLabel');
        segs.forEach(s => { s.className = 'strength-seg'; });

        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = ['weak','weak','medium','strong','strong'];
        const labels = ['Too short','Weak','Fair','Strong','Very strong'];
        const colors = ['#EF4444','#EF4444','#F59E0B','var(--green)','var(--green)'];

        for (let i = 0; i < score; i++) segs[i].classList.add(score <= 1 ? 'weak' : score === 2 ? 'medium' : 'strong');
        label.textContent = val.length === 0 ? 'Enter a password' : labels[score];
        label.style.color = val.length === 0 ? 'var(--text-muted)' : colors[score];
    }

    // ── Password match ──
    function checkMatch() {
        const pwd = document.getElementById('newPwd').value;
        const confirm = document.getElementById('confirmPwd').value;
        const msg = document.getElementById('matchMsg');
        if (!confirm) { msg.textContent = ''; return; }
        if (pwd === confirm) {
            msg.textContent = '✓ Passwords match';
            msg.style.color = 'var(--green)';
        } else {
            msg.textContent = '✗ Passwords do not match';
            msg.style.color = '#EF4444';
        }
    }
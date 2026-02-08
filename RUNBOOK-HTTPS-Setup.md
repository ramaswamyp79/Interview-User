# HTTPS/SSL Certificate Setup Runbook
**Date:** February 8, 2026  
**Domain:** answerflow-ai.com, www.answerflow-ai.com  
**Final Status:** ✅ SUCCESS

---

## Problem Statement
Website showing SSL certificate error: `ERR_CERT_AUTHORITY_INVALID` when accessing https://www.answerflow-ai.com

---

## Approaches Tried (Failed)

### ❌ Attempt 1: GCP Managed Certificates (Failed)
**Duration:** ~2 hours  
**Reason for Failure:** 
- Certificate stuck in "FailedNotVisible" status
- cert-manager pods couldn't schedule (insufficient resources)
- Service type was ClusterIP (needed NodePort for GCE ingress)

**What we tried:**
- Changed service to NodePort
- Added both domains to ingress rules
- Deleted and recreated certificate multiple times
- Waited 30-60 minutes for provisioning

**Why it failed:** GCE ingress + GCP Managed Certificates wasn't properly validating domain ownership despite correct DNS configuration.

---

## ✅ Final Solution: NGINX Ingress + cert-manager + Let's Encrypt

### Prerequisites
- DNS already pointing to load balancer IP: `34.71.63.107`
- NGINX Ingress Controller already installed in cluster
- Frontend pod running and healthy

---

## Step-by-Step Commands (Successful Approach)

### **Step 1: Clean Up Failed GCE Resources**

```powershell
# Delete old GCE ingress
kubectl delete ingress frontend-ingress

# Delete GCP managed certificate
kubectl delete managedcertificate frontend-cert
```

---

### **Step 2: Update Frontend Service to ClusterIP**

**File:** `user-frontend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: user-frontend-service
spec:
  selector:
    app: user-frontend
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

**Apply:**
```powershell
kubectl apply -f Kubernet\user-frontend-service.yaml
```

---

### **Step 3: Create Let's Encrypt ClusterIssuer**

**File:** `letsencrypt-issuer.yaml`

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@answerflow-ai.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

**Apply:**
```powershell
kubectl apply -f Kubernet\letsencrypt-issuer.yaml
```

---

### **Step 4: Create NGINX Ingress with TLS**

**File:** `nginx-ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - answerflow-ai.com
        - www.answerflow-ai.com
      secretName: frontend-tls-cert
  rules:
    - host: answerflow-ai.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: user-frontend-service
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 5000
    - host: www.answerflow-ai.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: user-frontend-service
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 5000
```

**Apply:**
```powershell
kubectl apply -f Kubernet\nginx-ingress.yaml
```

---

### **Step 5: Install cert-manager (Minimal Resources)**

**File:** `cert-manager-minimal.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cert-manager-webhook
  namespace: cert-manager
spec:
  ports:
  - port: 443
    targetPort: 6443
  selector:
    app: cert-manager-webhook
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cert-manager
  namespace: cert-manager
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cert-manager
  template:
    metadata:
      labels:
        app: cert-manager
    spec:
      serviceAccountName: cert-manager
      containers:
      - name: cert-manager
        image: quay.io/jetstack/cert-manager-controller:v1.14.6
        args:
        - --cluster-resource-namespace=$(POD_NAMESPACE)
        - --leader-election-namespace=$(POD_NAMESPACE)
        - --acme-http01-solver-image=quay.io/jetstack/cert-manager-acmesolver:v1.14.6
        env:
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        resources:
          requests:
            cpu: 30m
            memory: 64Mi
          limits:
            cpu: 100m
            memory: 256Mi
        ports:
        - containerPort: 9402
        - containerPort: 9403
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cert-manager
  namespace: cert-manager
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cert-manager
rules:
- apiGroups: ["cert-manager.io"]
  resources: ["certificates", "certificaterequests", "issuers", "clusterissuers"]
  verbs: ["*"]
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: [""]
  resources: ["events"]
  verbs: ["create", "patch"]
- apiGroups: ["acme.cert-manager.io"]
  resources: ["orders", "challenges"]
  verbs: ["*"]
- apiGroups: ["coordination.k8s.io"]
  resources: ["leases"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get"]
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get", "list"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cert-manager
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cert-manager
subjects:
- kind: ServiceAccount
  name: cert-manager
  namespace: cert-manager
```

**Create namespace and apply:**
```powershell
kubectl create namespace cert-manager
kubectl apply -f Kubernet\cert-manager-minimal.yaml
```

---

### **Step 6: Install cert-manager Webhook**

**File:** `cert-manager-webhook.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cert-manager-webhook
  namespace: cert-manager
spec:
  ports:
  - port: 443
    targetPort: 6443
    protocol: TCP
  selector:
    app: cert-manager-webhook
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cert-manager-webhook
  namespace: cert-manager
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cert-manager-webhook
  template:
    metadata:
      labels:
        app: cert-manager-webhook
    spec:
      serviceAccountName: cert-manager-webhook
      containers:
      - name: cert-manager-webhook
        image: quay.io/jetstack/cert-manager-webhook:v1.14.6
        args:
        - --secure-port=6443
        - --dynamic-serving-ca-secret-namespace=cert-manager
        - --dynamic-serving-ca-secret-name=cert-manager-webhook-ca
        - --dynamic-serving-dns-names=cert-manager-webhook,cert-manager-webhook.cert-manager,cert-manager-webhook.cert-manager.svc
        resources:
          requests:
            cpu: 20m
            memory: 64Mi
          limits:
            cpu: 100m
            memory: 256Mi
        ports:
        - name: webhook
          containerPort: 6443
        livenessProbe:
          httpGet:
            scheme: HTTPS
            path: /healthz
            port: 6443
          initialDelaySeconds: 10
          periodSeconds: 10
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cert-manager-webhook
  namespace: cert-manager
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cert-manager-webhook
rules:
- apiGroups: ["cert-manager.io"]
  resources: ["mutatingwebhookconfigurations", "validatingwebhookconfigurations"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["cert-manager.io"]
  resources: ["certificates"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cert-manager-webhook
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cert-manager-webhook
subjects:
- kind: ServiceAccount
  name: cert-manager-webhook
  namespace: cert-manager
---
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: cert-manager-webhook
webhooks:
- name: webhook.cert-manager.io
  admissionReviewVersions: ["v1"]
  clientConfig:
    service:
      name: cert-manager-webhook
      namespace: cert-manager
      path: /validate
    caBundle: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN1RENDQWFNQ0NRQzhQTklSamM5eFN0REFOQmdrcWhraUc5dzBCQVFzRkFEQW5NUXN3Q1FZRFZRUUdFd0pWVXpFVwpNQkFHQTFVRUF3d0xSMjl2WjJ4bElGSmxiR0YwTUI0WERUSXhNVEE1TVM4eE5qRTBNRGs1Vm9ZRFRReU1URXcKT1RFdk1UWXhOREE1T1ZvdwpNSUlCRVRBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVEwQWdnRUJBQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQgpjcWgJCkg4cThFNEpqc2hXWGFXWWFpMy85N1hPV0pNTGFIM0ZPN2xnbTdxK2RhRUJObk5ycjA5aFJvWGZTZWEKVjYyekdlTkN3X3ZybEVXZjBLQk9QM0txL1daeTN2YkU5WkJQNlNCT3Nfb3JCV09MbWhDQUtKREhTRElkREVaYgouVHFQSlQyNGVWVEVxOWxVVzBTRUo3Zg==
  rules:
  - operations: ["CREATE", "UPDATE"]
    apiGroups: ["cert-manager.io"]
    apiVersions: ["v1"]
    resources: ["certificates"]
  failurePolicy: Fail
  sideEffects: None
---
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: cert-manager-webhook
webhooks:
- name: webhook.cert-manager.io
  admissionReviewVersions: ["v1"]
  clientConfig:
    service:
      name: cert-manager-webhook
      namespace: cert-manager
      path: /mutate
    caBundle: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN1RENDQWFNQ0NRQzhQTklSamM5eFN0REFOQmdrcWhraUc5dzBCQVFzRkFEQW5NUXN3Q1FZRFZRUUdFd0pWVXpFVwpNQkFHQTFVRUF3d0xSMjl2WjJ4bElGSmxiR0YwTUI0WERUSXhNVEE1TVM4eE5qRTBNRGs1Vm9ZRFRReU1URXdKT1RFdk1UWXhOREE1T1ZvdwpNSUlCRVRBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVEwQWdnRUJBQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQgpjcWgJCkg4cThFNEpqc2hXWGFXWWFpMy85N1hPV0pNTGFIM0ZPN2xnbTdxK2RhRUJObk5ycjA5aFJvWGZTZWEKVjYyekdlTkN3X3ZybEVXZjBLQk9QM0txL1daeTN2YkU5WkJQNlNCT3Nfb3JCV09MbWhDQUtKREhTRElkREVaYgouVHFQSlQyNGVWVEVxOWxVVzBTRUo3Zg==
  rules:
  - operations: ["CREATE"]
    apiGroups: ["cert-manager.io"]
    apiVersions: ["v1"]
    resources: ["certificates"]
  failurePolicy: Fail
  sideEffects: None
```

**Apply:**
```powershell
kubectl apply -f Kubernet\cert-manager-webhook.yaml
```

**Wait for webhook to start:**
```powershell
Start-Sleep -Seconds 15
```

---

### **Step 7: Restart cert-manager Pod**

**Restart to pick up RBAC permissions:**
```powershell
kubectl delete pod -n cert-manager -l app=cert-manager
```

**Wait for restart:**
```powershell
Start-Sleep -Seconds 10
```

---

## Verification Commands

### Check cert-manager pods are running:
```powershell
kubectl get pods -n cert-manager
```

**Expected output:**
```
NAME                                    READY   STATUS    RESTARTS   AGE
cert-manager-655d5c9894-cwjrf           1/1     Running   0          75s
cert-manager-webhook-6b75589f77-6m75m   1/1     Running   0          19s
```

---

### Check certificate was created:
```powershell
kubectl get certificate
```

**Expected output:**
```
NAME                READY   SECRET              ISSUER             STATUS   AGE
frontend-tls-cert   True    frontend-tls-cert   letsencrypt-prod   Ready    2m
```

---

### Check ingress has both HTTP and HTTPS:
```powershell
kubectl get ingress frontend-ingress
```

**Expected output:**
```
NAME               CLASS   HOSTS                                     ADDRESS        PORTS     AGE
frontend-ingress   nginx   answerflow-ai.com,www.answerflow-ai.com   34.71.63.107   80, 443   5m
```

---

### Test HTTPS connection:
```powershell
# Test main domain
Invoke-WebRequest -Uri "https://answerflow-ai.com" -UseBasicParsing

# Test www subdomain
Invoke-WebRequest -Uri "https://www.answerflow-ai.com" -UseBasicParsing
```

**Expected output:**
```
StatusCode        : 200
```

---

## Troubleshooting Commands

### Check certificate status:
```powershell
kubectl describe certificate frontend-tls-cert
```

### Check cert-manager logs:
```powershell
kubectl logs -n cert-manager -l app=cert-manager --tail=50
```

### Check certificate secret exists:
```powershell
kubectl get secret frontend-tls-cert
```

### Check DNS resolution:
```powershell
nslookup answerflow-ai.com 8.8.8.8
nslookup www.answerflow-ai.com 8.8.8.8
```

---

## Files Created (Final Solution)

### ✅ Active/In-Use:
1. `letsencrypt-issuer.yaml` - Let's Encrypt ClusterIssuer
2. `nginx-ingress.yaml` - NGINX ingress with TLS
3. `cert-manager-minimal.yaml` - cert-manager controller
4. `cert-manager-webhook.yaml` - cert-manager webhook
5. `user-frontend-service.yaml` - Frontend service (updated to ClusterIP)
6. `user-frontend-deployment.yaml` - Frontend deployment (existing)

### ❌ Obsolete/Not in Use:
1. `frontend-cert.yaml` - GCP Managed Certificate (not used)
2. `frontend-ingress.yaml` - GCE ingress (replaced by nginx-ingress.yaml)
3. `frontend-backendconfig.yaml` - GCE backend config (not used)

---

## Key Learnings

### What Worked:
1. **NGINX Ingress + cert-manager is more reliable** than GCP Managed Certificates
2. **cert-manager with minimal resources** (30m CPU, 64Mi RAM) works fine
3. **ClusterIP service type** is correct for NGINX ingress
4. **Both domains must be in ingress rules** (answerflow-ai.com AND www.answerflow-ai.com)
5. **Let's Encrypt HTTP-01 challenge** worked immediately once cert-manager was properly configured

### What Didn't Work:
1. **GCP Managed Certificates** - stuck in "FailedNotVisible" despite correct DNS
2. **NodePort service** - only needed for GCE ingress, caused issues with NGINX
3. **cert-manager without webhook** - couldn't validate certificate requests
4. **cert-manager without proper RBAC** - couldn't acquire leader lease or process ingresses

### Critical Components:
- cert-manager controller
- cert-manager webhook
- Proper RBAC with lease permissions
- ClusterIssuer configured for Let's Encrypt
- Ingress annotation: `cert-manager.io/cluster-issuer: "letsencrypt-prod"`

---

## Resource Usage

### cert-manager Pods:
- **cert-manager controller:** 30m CPU, 64Mi RAM
- **cert-manager webhook:** 20m CPU, 64Mi RAM
- **Total:** ~50m CPU, ~128Mi RAM

### Cluster Capacity:
- **Available:** 3860m CPU total
- **Used by cert-manager:** 50m CPU (<2%)
- **Sufficient capacity:** ✅ Yes

---

## Certificate Auto-Renewal

**cert-manager automatically renews certificates 30 days before expiry.**

### Monitor renewal:
```powershell
kubectl describe certificate frontend-tls-cert
```

Look for `Renewal Time` in the output.

---

## Success Metrics

✅ **HTTPS working:** https://answerflow-ai.com  
✅ **WWW subdomain working:** https://www.answerflow-ai.com  
✅ **HTTP redirects to HTTPS:** Enabled via `nginx.ingress.kubernetes.io/ssl-redirect: "true"`  
✅ **Valid SSL certificate:** Issued by Let's Encrypt  
✅ **Auto-renewal enabled:** cert-manager handles it  
✅ **Load balancer IP stable:** 34.71.63.107 (static IP configured)  

---

## Maintenance

### Update certificate email:
Edit `letsencrypt-issuer.yaml` and change email, then:
```powershell
kubectl apply -f Kubernet\letsencrypt-issuer.yaml
```

### Force certificate renewal:
```powershell
kubectl delete secret frontend-tls-cert
kubectl delete certificate frontend-tls-cert
kubectl apply -f Kubernet\nginx-ingress.yaml
```

### Check cert-manager health:
```powershell
kubectl get pods -n cert-manager
kubectl logs -n cert-manager -l app=cert-manager
```

---

**End of Runbook**  
**Last Updated:** February 8, 2026  
**Status:** ✅ Production Ready

import { k8sCoreV1Api } from './config.js';

export async function createPods(sandboxId) {
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                app: 'sandbox',
                sandboxId: sandboxId
            }
        },
        spec:{
            volumes: [
                {
                    name: "workspace-volume",
                    emptyDir: {}
                }
            ],
            initContainers: [
                {
                    name: "init-container",
                    image: "template:latest",
                    imagePullPolicy: "IfNotPresent",
                    command: ['sh','-c','cp -r /workspace/. /seed'],
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/seed"
                        }
                    ]
                }
            ],
            containers: [
                {
                    image: "template:latest",
                    imagePullPolicy: "IfNotPresent",
                    name: "sandbox-container",
                    ports: [{ containerPort: 5173, name: "http" }],
                    readinessProbe: {
                        httpGet: {
                            path: "/",
                            port: 5173
                        },
                        initialDelaySeconds: 10,
                        periodSeconds: 5,
                        timeoutSeconds: 3,
                        failureThreshold: 12
                    },
                    livenessProbe: {
                        httpGet: {
                            path: "/",
                            port: 5173
                        },
                        initialDelaySeconds: 30,
                        periodSeconds: 10,
                        timeoutSeconds: 3,
                        failureThreshold: 3
                    },
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace"
                        }
                    ],
                    resources: {
                        limits: {
                            cpu: "500m",
                            memory: "1Gi"
                        },
                        requests: {
                            cpu: "250m",
                            memory: "500Mi"
                        }
                    }
                },{
                    image: "agent:latest",
                    imagePullPolicy: "IfNotPresent",
                    name: "agent-container",
                    ports: [{containerPort: 3000, name: "http"}],
                    readinessProbe: {
                        httpGet: {
                            path: "/",
                            port: 3000
                        },
                        initialDelaySeconds: 5,
                        periodSeconds: 5,
                        timeoutSeconds: 3,
                        failureThreshold: 12
                    },
                    livenessProbe: {
                        httpGet: {
                            path: "/",
                            port: 3000
                        },
                        initialDelaySeconds: 20,
                        periodSeconds: 10,
                        timeoutSeconds: 3,
                        failureThreshold: 3
                    },
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace"
                        }
                    ],
                    resources: {
                        limits: {
                            cpu: "500m",
                            memory: "1Gi"
                        },
                        requests: {
                            cpu: "250m",
                            memory: "500Mi"
                        }
                    }
                }   
            ]
        }
    }
    
    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace:'default',
        body: podManifest
    });
    return response;
};

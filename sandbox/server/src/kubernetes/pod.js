import { k8sCoreV1Api } from './config.js';

export async function createPods(sandboxId,projectId) {
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
                },
                {
                    image: "sync-agent",
                    imagePullPolicy: "IfNotPresent",
                    name: "sync-agent-container",
                    ports: [{ containerPort: 4000, name: "http" }],
                    resources: {
                        limits: {cpu: "500m", memory: "1Gi"},
                        requests: {cpu: "250m", memory: "500Mi"}
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace'
                        }
                    ],
                    env: [
                        {
                            name: "PROJECT_ID",
                            value: projectId
                        },
                        {
                            name: "AWS_ACCESS_KEY_ID",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws-secrets",
                                    key: "AWS_ACCESS_KEY_ID"
                                }
                            }
                        },
                        {
                            name: "AWS_SECRET_ACCESS_KEY",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws-secrets",
                                    key: "AWS_SECRET_ACCESS_KEY"
                                }
                            }
                        },
                        {
                            name: "AWS_REGION",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws-secrets",
                                    key: "AWS_REGION"
                                }
                            }
                        },
                        {
                            name: "S3_BUCKET_NAME",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws-secrets",
                                    key: "S3_BUCKET_NAME"
                                }
                            }
                        },
                    ]
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


export async function deletePods(sandboxId) {
    const response = await k8sCoreV1Api.deleteNamespacedPod({
        namespace: 'default',
        name: `sandbox-pod-${sandboxId}`
    },{
        gracePeriodSeconds: 0
    });
    return response;
};
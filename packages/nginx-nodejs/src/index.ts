import express from 'express';
import k8s = require('@kubernetes/client-node');
import Stream = require('stream');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const exec = new k8s.Exec(kc);

const app = express();
const PORT = 8080;

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.get('/list-pods', (req, res) => {
    k8sApi
        .listNamespacedPod('default')
        .then((data) => {
            res.send(data.body);
        })
        .catch((err) => res.status(500).send(err));
});

app.get('/reload-nginx', async (req, res) => {
    let commands = ['/bin/bash'];

    var myws = new Stream.Readable({
        read(size) {},
    });
    exec.exec(
        'default',
        'nginx-react-fc79fffc8-pqvkk',
        'nginx-react',
        commands,
        process.stdout,
        process.stderr,
        myws,
        true,
        (status: k8s.V1Status) => {
            console.log(status);
        },
    );
    myws.push('service nginx stop\n');
    res.send('no errors').end();
    // exec.exec(
    //     'default',
    //     'nginx-react-fc79fffc8-9bvj2',
    //     'nginx-react',
    //     'nginx -s reload',
    //     // ['/bin/sh', '/usr/sbin/nginx -s reload'],
    //     // 'ENV PATH=$PATH:/opt/bitnami/nginx/sbin/nginx && nginx -s reload',
    //     process.stdout as Stream.Writable,
    //     process.stderr as Stream.Writable,
    //     process.stdin as Stream.Readable,
    //     true /* tty */,
    //     (status: k8s.V1Status) => {
    //         res.send(status);
    //     },
    // ).catch((err) => {
    //     console.log(err);
    //     res.status(500).end();
    // });
});

app.listen(PORT, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);

    const { body } = await k8sApi.listNamespacedPod('default');

    body.items.forEach((pod) => {
        const name = pod.metadata?.name || 'unnamed';

        pod.spec?.containers.forEach((cont) => {
            console.log(`Pod: ${name} --- Container: ${cont.name}`);
        });
    });
});

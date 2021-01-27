import express from 'express';
import k8s = require('@kubernetes/client-node');
import Stream = require('stream');
import fs = require('fs');
import bodyParser = require('body-parser');
import { NginxConfFile } from 'nginx-conf';

NginxConfFile.create(`sites-enabled/vhost.locations`, (err, conf) => {
    if (err) return console.log(err);
    // console.log(conf.nginx.server[0].location.forEach((loc) => console.log(loc.toString())));
    console.log(conf.nginx);
});

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const exec = new k8s.Exec(kc);

const app = express();
app.use(bodyParser.text());

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
        'nginx-poc',
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
    myws.push('service nginx reload\n');
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

app.post('/nignx-html', (req, res) => {
    fs.writeFile('/pod-data/index.html', req.body, (err) => {
        // throws an error, you could also catch it here
        if (err) res.status(500).send(err);

        // success case, the file was saved
        res.send('Success');
    });
});

app.listen(8080, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${8080}`);

    const { body } = await k8sApi.listNamespacedPod('default');

    body.items.forEach((pod) => {
        const name = pod.metadata?.name || 'unnamed';

        pod.spec?.containers.forEach((cont) => {
            console.log(`Pod: ${name} --- Container: ${cont.name}`);
        });
    });
});

# gcp-proxy-func
Very simple Google Cloud Function that proxies requests using Express and `http-proxy-middleware`. You define the address that requests should be proxied to by filling out config.js (copy `config.example.js` to `config.js`, and then change the URL).

# Using
Fill in `config.js`, and then either zip up the files and upload via Gcloud admin, or use [the Gcloud CLI](https://cloud.google.com/sdk/gcloud/) and `npm run deploy`. Or see below if using this to proxy to Ngrok.

# Ngrok
If you want to use this to have a stable Google Cloud Function address that proxies requests to a dynamic Ngrok address ([see this blog post for details](https://joshuatz.com/posts/2019/using-google-cloud-functions-permanent-url-to-proxy-ngrok-requests/)), you can automatically redeploy the function with the correct Ngrok public URL after it has changed, by using `npm run ngrok-deploy`.

This command will grab the Ngrok public URL via the localhost API, update config.js by using `fs` to write to the file, and then redeploy your GCloud function to point to the updated URL.
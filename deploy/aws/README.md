# Deploy Baker’s House through GitHub to AWS

This project is a static website with WhatsApp checkout. GitHub Actions builds it and uploads the generated files to S3; CloudFront serves them over HTTPS. No application server, Razorpay integration or order database is required. See [START-HERE.md](START-HERE.md) for the setup sequence.

Customers select Cash on Delivery, Pay at pickup or Online payment via WhatsApp. Both choices open the bakery’s WhatsApp chat with a prepared order message. The customer taps Send. For manual online payment, the message requests payment details and asks the customer to pay separately and attach a screenshot in that chat. Staff verify receipt and confirm the order. The website does not send messages automatically, attach screenshots or verify payments.

## Repository and build

The website repository is [`vikashkr1712/bakers-house`](https://github.com/vikashkr1712/bakers-house). No ZIP or extracted source copy is needed. Keep the current app source and deployment files together at the repository root:

```text
.github/workflows/deploy-aws.yml
deploy/aws/
src/
public/
index.html
package.json
package-lock.json
vite.config.js
.gitignore
```

Do not commit `.env.local`, `.payment-data`, `.publish`, `node_modules`, report outputs, test screenshots or original image archives. GitHub builds `dist/` and uploads only its contents. Server/API source and database/payment dependencies are not part of this hosted storefront.

Use Node.js 24 locally:

```sh
npm ci
npm run build
npm run preview
```

Routes use hash URLs such as `/#/cakes` and `/#/checkout`. They work on S3/CloudFront without a server rewrite or custom 403/404 response mapping. The bucket root must contain `index.html`, `assets/`, `fonts/` and `images/`; there must be no extra `dist/` prefix.

## S3 and CloudFront

Use a general purpose S3 bucket with ACLs disabled (Bucket owner enforced) and SSE-S3 encryption. The existing bucket is in Sydney, `ap-southeast-2`; the GitHub variable must match the bucket's actual region.

For the customer-facing site, configure CloudFront with:

- Origin: the regular S3 bucket origin selected from the console, not its `s3-website-...` endpoint.
- Origin access: Origin Access Control (OAC), with signing set to Always/Sign requests.
- Viewer protocol policy: Redirect HTTP to HTTPS.
- Default root object: `index.html`.
- Compression enabled, with GET/HEAD sufficient for this static site.

CloudFront needs permission to read that bucket. `bucket-policy.json` is a read-only OAC policy template scoped to one distribution. Replace `YOUR_BUCKET_NAME`, `YOUR_AWS_ACCOUNT_ID` and `YOUR_DISTRIBUTION_ID` after creating the distribution. Review any existing bucket policy and preserve unrelated required statements; do not paste over a shared policy blindly.

For an existing public S3 website, first configure and verify the CloudFront origin and its OAC policy, then remove the old public-read statement and enable all S3 Block Public Access settings. The old HTTP S3 website URL will no longer be the public website address. Static website hosting is unnecessary with the regular S3 origin; visitors use the CloudFront HTTPS URL. This guide does not create or change AWS resources automatically.

## GitHub authentication

GitHub Actions uses OIDC and a temporary IAM role. No permanent AWS access-key secret is required.

1. In IAM, create or reuse the OpenID Connect provider `https://token.actions.githubusercontent.com` with audience `sts.amazonaws.com`.
2. Create an IAM role using `github-trust-policy.json`. Replace `YOUR_AWS_ACCOUNT_ID` with the intended account. The repository subjects are set to `vikashkr1712/bakers-house`; update them only if hosting from a different repository.
3. Keep the `main` branch restriction. The two subject patterns support GitHub's older and immutable-ID subject formats; do not broaden them to unrestricted repositories.
4. Attach `github-role-policy.json` as an inline policy after replacing both bucket-name placeholders. This grants bucket listing/location and object upload for that bucket only.
5. Copy the full IAM role ARN. An existing upload role can be reused if its trust and bucket permissions match.

The upload role does not create AWS resources, edit bucket policies or delete objects. CloudFront's read policy and GitHub's upload policy are separate permissions.

## GitHub variables and deployment

In the repository, open **Settings > Secrets and variables > Actions > Variables**, then add:

| Variable | Value |
| --- | --- |
| `AWS_REGION` | `ap-southeast-2` for the existing Sydney bucket |
| `S3_BUCKET` | Bucket name only, without `s3://` or a folder |
| `AWS_ROLE_ARN` | Full ARN of the GitHub upload role |

Open **Actions > Deploy bakery website to AWS > Run workflow**, select `main` and run it. The workflow is manual: committing or pushing source does not start an AWS deployment. It runs `npm ci` and `npm run build`, authenticates with OIDC, uploads assets and public files, then publishes `index.html` last. Existing objects are not automatically deleted.

After a deployment, use the CloudFront HTTPS distribution URL. If updating existing files, use a CloudFront invalidation for changed cached paths (`/*` refreshes the complete website) when immediate freshness is needed. The provided upload role does not include CloudFront invalidation permissions, so this is a separate console action. Hashed application assets get long caching, public files get one hour, and `index.html` is uploaded with `no-cache`.

## Check the website

- Open and refresh the shop, a filtered collection and a product detail URL.
- Add a product, edit a cake customization, change cart quantities and inspect the estimate.
- Inspect both cash and manual online-payment WhatsApp messages with dummy details without sending an order to the bakery.
- Confirm the chosen products, address or pickup store, requested slot and estimated total are present.
- Confirm online payment stays unverified and asks for payment and a screenshot in chat.
- Check mobile navigation and the checkout layout.

If assets are missing, check object paths and the upload run. If CloudFront shows AccessDenied, check the S3 origin, OAC and the distribution ARN in the bucket policy. If GitHub cannot assume the role, check provider audience, account, repository, branch and `AWS_ROLE_ARN`.

## References

- [AWS CloudFront OAC and private S3 origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [GitHub OIDC with AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [AWS credentials action](https://github.com/aws-actions/configure-aws-credentials)

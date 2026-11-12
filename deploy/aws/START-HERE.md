# AWS hosting setup sequence

The app uses one regular production build, with the complete WhatsApp checkout. ZIP packages and extracted duplicate projects are not part of hosting.

1. Use the current source in [`vikashkr1712/bakers-house`](https://github.com/vikashkr1712/bakers-house). Confirm `package.json`, `src/`, `public/` and `.github/workflows/deploy-aws.yml` are at the root.
2. Choose the S3 bucket for the website. Keep the exact name and region; the existing bucket `bakers-house-s3-test-vikash-1234` is in `ap-southeast-2`. Its name does not restrict it to a test site.
3. Create a CloudFront distribution with the regular S3 bucket origin, OAC with signing enabled, Redirect HTTP to HTTPS and default root object `index.html`. Do not choose the S3 website endpoint as an OAC origin.
4. Grant that distribution read access using the template in `bucket-policy.json`, after replacing all placeholders. Review existing policy statements before editing the bucket.
5. Once CloudFront access is configured and verified, remove any old anonymous public-read statement and enable all bucket Block Public Access settings. Use the CloudFront HTTPS URL for visitors.
6. In IAM, add or reuse GitHub's OIDC provider (`https://token.actions.githubusercontent.com`, audience `sts.amazonaws.com`).
7. Create or reuse the upload role using `github-trust-policy.json` and `github-role-policy.json`, replacing the account/bucket placeholders. The trust policy is scoped to `vikashkr1712/bakers-house` on `main`; an older role scoped to the separate test repository must be updated. Keep the branch restriction and bucket-scoped permissions.
8. In GitHub **Settings > Secrets and variables > Actions > Variables**, set `AWS_REGION`, `S3_BUCKET` and `AWS_ROLE_ARN`.
9. In **Actions**, run **Deploy bakery website to AWS** on `main`. Wait for successful build and upload steps.
10. Open the CloudFront HTTPS URL, refresh a product URL, try the cart, and inspect cash and manual online-payment messages with dummy details. Customers still tap Send and attach payment screenshots in WhatsApp; the bakery verifies receipt.

For later releases, push the changed app source and manually run the workflow again. If existing cached files need immediate refresh, create a CloudFront invalidation for the changed paths. See [README.md](README.md) for details, permissions templates and troubleshooting.

These files prepare the app for hosting; they do not claim that AWS setup or a deployment has already completed.

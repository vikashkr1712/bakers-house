# AWS hosting setup sequence

The app uses one regular production build, with the complete WhatsApp checkout. ZIP packages and extracted duplicate projects are not part of hosting.

1. Use the current source in [`vikashkr1712/bakers-house`](https://github.com/vikashkr1712/bakers-house). Confirm `package.json`, `src/`, `public/` and `.github/workflows/deploy-aws.yml` are at the root.
2. Use the website bucket `bakers-house-vikash-812366951407` in Sydney, `ap-southeast-2`. Keep the exact name and region in GitHub variables.
3. Create a CloudFront distribution with the regular S3 bucket origin, OAC with signing enabled, Redirect HTTP to HTTPS and default root object `index.html`. Do not choose the S3 website endpoint as an OAC origin.
4. Grant that distribution read access using the template in `bucket-policy.json`, after replacing all placeholders. Review existing policy statements before editing the bucket.
5. Once CloudFront access is configured and verified, remove any old anonymous public-read statement and enable all bucket Block Public Access settings. Use the CloudFront HTTPS URL for visitors.
6. In IAM, create `GitHubBakersHouseUploader` without console access and attach the bucket-scoped permissions in `github-role-policy.json`, replacing both bucket placeholders. This IAM-user route works without enabling the account's restricted OIDC-provider feature.
7. Create the user's access key and save its ID and secret directly as GitHub repository secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. Never commit the values or include them in screenshots or chat.
8. Add `cloudfront-refresh-policy.json` as a second inline policy on `GitHubBakersHouseUploader`, named `RefreshBakersHouseCloudFront`. In GitHub **Settings > Secrets and variables > Actions > Variables**, set `AWS_REGION` to `ap-southeast-2`, `S3_BUCKET` to `bakers-house-vikash-812366951407` and `CLOUDFRONT_DISTRIBUTION_ID` to `E51AZB5P1JPQH`. The old `AWS_ROLE_ARN` variable is unused.
9. Ensure the updated secret-based workflow has been pushed. Each push to `main` automatically starts **Deploy bakery website to AWS**; the manual **Run workflow** button remains available. Wait for successful build, upload and CloudFront refresh steps. Do not rerun an old OIDC-based commit.
10. Open the CloudFront HTTPS URL, refresh a product URL, try the cart, and inspect cash and manual online-payment messages with dummy details. Customers still tap Send and attach payment screenshots in WhatsApp; the bakery verifies receipt.

For later releases, push the changed app source to `main`. GitHub automatically builds and uploads the website, then refreshes the CloudFront cache. Check that the run succeeds before expecting the new version, then refresh the browser. See [README.md](README.md) for details, permissions templates and troubleshooting.

These files prepare the app for hosting; they do not claim that AWS setup or a deployment has already completed.

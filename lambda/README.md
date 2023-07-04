Make sure you have docker locally installed and followed the below steps to add dependencies and code to Lambda function.

#### Create env and download dependencies

1. `cd lambda`
2. `docker pull public.ecr.aws/sam/build-python3.10`
3. `docker run -v "$(pwd):/var/task" -it "public.ecr.aws/sam/build-python3.10"`
4. `rm -r python`
5. `mkdir python`
6. `pip install scikit-learn -t python/`

#### Zip files

7. `zip -r isomorphic_dependencies.zip python`
8. `zip -r lambda_function.zip lambda_function.py`

#### Upload to Lambda

9. Upload `lambda_function.zip` to code of lambda function
10. Upload `isomorphic_dependencies.zip` file to s3 bucket.
11. Create new layer and point to uploaded zip file in s3
12. Add layer to lambda function

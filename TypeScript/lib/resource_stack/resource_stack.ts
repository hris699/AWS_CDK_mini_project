import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_apigateway } from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { aws_dynamodb } from 'aws-cdk-lib';
import * as path from 'path';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ResourceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps,) {
    super(scope, id, props,);

    // The code that defines your stack goes here


    // Creating Table for DynamoDB
    const tableBooks = new aws_dynamodb.Table(this, 'Books', {
      partitionKey: { name: 'book_id', type: aws_dynamodb.AttributeType.STRING },
    });

    // API Gateway Integration
    const api = new aws_apigateway.RestApi(this, 'books-api',{});

    // Resources for HTTP API methods
    const BooksResource  = api.root.addResource('books')
    const BookWithID = BooksResource.addResource("{book_id}")

    // Lambda function to fetch All the Books
    const listBooks = new aws_lambda.Function(this, 'listBooks',{
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      handler: 'get.GetHandler',
      code: aws_lambda.Code.fromAsset(path.join(__dirname, 'lambda_handler')),
      environment: {
        Books_Table_Name: tableBooks.tableName
      }
    })
    // Granting permission to the lambda function
    tableBooks.grantReadData(listBooks)

    // GET method integration with lambda function
    BooksResource.addMethod('GET',new aws_apigateway.LambdaIntegration(listBooks))


   // Lambda function to Post books
    const postBooks = new aws_lambda.Function(this, 'postBooks',{
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      handler: 'post.PostHandler',
      code: aws_lambda.Code.fromAsset(path.join(__dirname, 'lambda_handler')),
      environment: {
        Books_Table_Name: tableBooks.tableName
      }
    })
    // Granting permission to the lambda function
    tableBooks.grantReadWriteData(postBooks)

    // POST method integration with lambda function
    BooksResource.addMethod('POST',new aws_apigateway.LambdaIntegration(postBooks))

    // Lambda function to fetch Books by Id
    const BookById = new aws_lambda.Function(this, 'BookById',{
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      handler: 'getById.GetByIdHandler',
      code: aws_lambda.Code.fromAsset(path.join(__dirname, 'lambda_handler')),
      environment: {
        Books_Table_Name: tableBooks.tableName
      }
    })
    tableBooks.grantReadData(BookById)
    BookWithID.addMethod('GET',new aws_apigateway.LambdaIntegration(BookById))



    // Lambda function to update Books by Id
    const updateBooks = new aws_lambda.Function(this, 'updateBooks',{
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      handler: 'update.UpdateHandler',
      code: aws_lambda.Code.fromAsset(path.join(__dirname, 'lambda_handler')),
      environment: {
        Books_Table_Name: tableBooks.tableName
      }
    })

    tableBooks.grantReadWriteData(updateBooks)
    BookWithID.addMethod('PUT',new aws_apigateway.LambdaIntegration(updateBooks))


    const deleteBooks = new aws_lambda.Function(this, 'deleteBooks',{
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      handler: 'delete.DeleteHandler',
      code: aws_lambda.Code.fromAsset(path.join(__dirname, 'lambda_handler')),
      environment: {
        Books_Table_Name: tableBooks.tableName
      }
    })

    tableBooks.grantReadWriteData(deleteBooks)
    BookWithID.addMethod('DELETE',new aws_apigateway.LambdaIntegration(deleteBooks))

  }
}


module.exports = ResourceStack
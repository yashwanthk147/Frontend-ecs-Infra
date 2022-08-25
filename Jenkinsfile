pipeline 
{
    environment 
    {
        AWS_DEFAULT_REGION = "ap-south-1"
        AWS_ACCOUNT_ID = "473666746939"
        GIT_REPO = "leapfrog-frontend"
        IMAGE_REPO_NAME = "uiecs-dev-repo"
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        ECS_CLUSTER = "ui-erp-dev"
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_ECS_TASK_DEFINITION = "ecs-uidev-task"
        AWS_ECS_TASK_DEFINITION_PATH = './ecs-uidev-task.json'
        AWS_ECS_SERVICE = 'ui-ecs-reactjs'
        AWS_ECS_SERVICE_TEMPLATE_PATH = './ui-ecs-service.json'
        AWS_TARGET_GROUP_ARN = 'arn:aws:elasticloadbalancing:ap-south-1:473666746939:targetgroup/ui-erp-dev-alb-default/61a336de74e8eed3'
        AWS_CONTAINER_NAME = 'react-js'
    }

    agent any
    stages 
    {
        stage('Checkout') {
          steps 
          {
            dir("$GIT_REPO"){
            git branch: 'Dev-Ui-Gin', credentialsId: 'jenkins-ecs-ccl-gin', url: "https://github.com/CCL-Products/$GIT_REPO"
            }
        
          }
          
       }


        stage('Checking Files') 
        {
            steps 
            {
                sh '''
                    echo "**********************************$(date "+%m%d%Y %T") : Checking the Files Package**********************************"
                    echo ${WORKSPACE}
                    pwd
                    ls
                '''  
            }
        }
        
        stage('Build Files') 
        {
            steps 
            {
                sh '''
                    echo "**********************************$(date "+%m%d%Y %T") : Checking the Files Package**********************************"
                    cd  $GIT_REPO
                    export NODE_OPTIONS="--max-old-space-size=2048"
                    npm i
                    CI=false npm run build
                '''  
            }
        }
    
        stage('Docker Build ') 
        {
            steps 
            {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE'){
                    sh '''
                    echo "**********************************$(date "+%m%d%Y %T") : Building Docker Image**********************************"
                    pwd
                    ls
                    docker build --no-cache -t $IMAGE_REPO_NAME:$BUILD_NUMBER ./$GIT_REPO/
                    docker tag $IMAGE_REPO_NAME:$BUILD_NUMBER $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$BUILD_NUMBER
                    '''
                }
                  
            }
        }
        
          stage('Docker Push ')
          {
              steps{
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE'){
                    sh '''
                    aws configure set region ap-south-1
                    aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
                    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$BUILD_NUMBER
                '''
                    }
              }
          }

        stage('Deploy on ECS ') {
            
            steps{
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE'){
                sh '''
                cd $GIT_REPO
                aws configure set region ${AWS_DEFAULT_REGION}
                sed -i 's|"targetGroupArn": ""|"targetGroupArn":"'"$AWS_TARGET_GROUP_ARN"'"|g' $AWS_ECS_SERVICE_TEMPLATE_PATH
                sed -i 's|"containerName": ""|"containerName":"'"$AWS_CONTAINER_NAME"'"|g' $AWS_ECS_SERVICE_TEMPLATE_PATH
                cat $AWS_ECS_SERVICE_TEMPLATE_PATH
                
                sed -i 's|"image": ""|"image": "'"$AWS_ACCOUNT_ID"'.dkr.ecr.'"$AWS_DEFAULT_REGION"'.amazonaws.com/'"$IMAGE_REPO_NAME"':'"$BUILD_NUMBER"'"|g' $AWS_ECS_TASK_DEFINITION_PATH
                sed -i 's|"name": ""|"name": "'"$AWS_CONTAINER_NAME"'"|g' $AWS_ECS_TASK_DEFINITION_PATH
                cat $AWS_ECS_TASK_DEFINITION_PATH
                aws ecs register-task-definition --region ${AWS_DEFAULT_REGION} --family ${AWS_ECS_TASK_DEFINITION} --cli-input-json file://${AWS_ECS_TASK_DEFINITION_PATH}
                '''
                script{
                def taskRevision = sh(script: "/usr/local/bin/aws ecs describe-task-definition --task-definition ${AWS_ECS_TASK_DEFINITION} | egrep \"revision\" | tr \"/\" \" \" | awk '{print \$2}' | sed 's/\"\$//'", returnStdout: true)
                echo "taskRevision:${taskRevision}"
                
                int count = sh(script: """
                    aws ecs describe-services --cluster $ECS_CLUSTER --services $AWS_ECS_SERVICE | jq '.services | length'
                """, 
                returnStdout: true).trim()

                echo "service count: $count"
                
                if (count >0) {
                    
                    //ECS service exists: update
                    echo "Updating ECS service $AWS_ECS_SERVICE..."
                    sh '''
                    /usr/local/bin/aws ecs update-service --cluster ${ECS_CLUSTER} --service ${AWS_ECS_SERVICE} --task-definition ${AWS_ECS_TASK_DEFINITION}
                    '''
                }
                else {
                    //ECS service does not exist: create new
                    echo "Creating new ECS service $AWS_ECS_SERVICE..."
                    
                    sh '''
                    cd $GIT_REPO
                    aws ecs create-service --cluster $ECS_CLUSTER --service-name $AWS_ECS_SERVICE --task-definition $AWS_ECS_TASK_DEFINITION --cli-input-json file://${AWS_ECS_SERVICE_TEMPLATE_PATH}
                    '''
                }
                    
            }
        }


                }

            }
            
        stage('Cleanup After build ') {
            steps{
                    sh '''
                    docker rmi $IMAGE_REPO_NAME:$BUILD_NUMBER
                    docker images -a |  grep $IMAGE_REPO_NAME
                    rm -rf $GIT_REPO
                '''
                }
            }
        }  
    post {
        
        success {
            emailext body: '$DEFAULT_CONTENT', subject: '$DEFAULT_SUBJECT', to: 'ykotha@dignosolutions.com, rdhari@dignosolutions.com, bkumar@dignosolutions.com, namrata@dignosolutions.com'
        }
        failure {
            emailext body: '$DEFAULT_CONTENT', subject: '$DEFAULT_SUBJECT', to: 'ykotha@dignosolutions.com, rdhari@dignosolutions.com, bkumar@dignosolutions.com, namrata@dignosolutions.com'
        }
       
    }
    }
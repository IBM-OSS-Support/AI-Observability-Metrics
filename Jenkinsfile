pipeline {
    agent { label 'master' }

    environment {
        SONARQUBE_ENV = 'sonarqube' 
    }

    stages {
        

        stage('SonarQube Scan') {
            steps {
                withCredentials([
                    string(credentialsId: 'SONAR_HOST_URL', variable: 'SONAR_URL'),
                    string(credentialsId: 'SONAR_AUTH_TOKEN_AI', variable: 'SONAR_TOKEN')
                ]) {
                    withSonarQubeEnv("${SONARQUBE_ENV}") {
                        sh """
                            sonar-scanner \
                                -Dsonar.projectKey=Ai-observability-metrics \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=${SONAR_URL} \
                                -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}

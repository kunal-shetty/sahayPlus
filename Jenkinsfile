pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.49.0-jammy'
        }
    }

    environment {
        BASE_URL = 'http://localhost:3000'
        SUPABASE_URL = credentials('SUPABASE_URL')
        SUPABASE_KEY = credentials('SUPABASE_KEY')
    }

    stages {
        stage('Installation') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('E2E Tests') {
            steps {
                // Install browsers and run tests
                sh 'npx playwright install --with-deps'
                sh 'npm run test:e2e'
            }
            post {
                always {
                    // Archive the HTML report for viewing in Jenkins
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright E2E Report'
                    ])
                }
            }
        }
    }

    post {
        failure {
            mail to: 'dev-team@sahay.app',
                 subject: "FAILED: Sahay E2E Tests - ${env.BUILD_NUMBER}",
                 body: "Check Playwright report: ${env.BUILD_URL}playwright-report/"
        }
    }
}

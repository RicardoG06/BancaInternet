"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
function getConfig(environment) {
    const baseConfig = {
        projectName: 'banca-internet',
        region: process.env.AWS_REGION || 'us-east-1',
        accountId: process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT || '',
        cognito: {
            domainPrefix: 'banca-internet-demo',
            emailFrom: 'noreply@bancainternet.com',
            mfaEnabled: true,
        },
        api: {
            stage: 'prod',
            description: 'Banca por Internet API',
            corsOrigins: ['http://localhost:5173', 'https://localhost:5173', 'http://localhost:5174', 'https://localhost:5174', 'http://localhost:3000', 'https://localhost:3000'],
        },
        dynamodb: {
            accountsTableName: 'banca-accounts',
            transactionsTableName: 'banca-transactions',
            idempotencyTableName: 'banca-idempotency',
            usersTableName: 'banca-users',
        },
        transfers: {
            dailyLimit: 500,
            minAmount: 0.01,
            maxAmount: 500,
        },
        monitoring: {
            logRetentionDays: 30,
            alarmThresholdErrors: 10,
            alarmThresholdLatency: 2000,
        },
        frontend: {
            url: 'http://localhost:5173',
            domain: 'localhost:5173',
        },
    };
    switch (environment) {
        case 'dev':
            return {
                ...baseConfig,
                environment: 'dev',
                cognito: {
                    ...baseConfig.cognito,
                    domainPrefix: 'banca-internet-dev',
                },
                api: {
                    ...baseConfig.api,
                    stage: 'dev',
                },
                dynamodb: {
                    accountsTableName: 'banca-accounts-dev',
                    transactionsTableName: 'banca-transactions-dev',
                    idempotencyTableName: 'banca-idempotency-dev',
                    usersTableName: 'banca-users-dev',
                },
            };
        case 'beta':
            return {
                ...baseConfig,
                environment: 'beta',
                cognito: {
                    ...baseConfig.cognito,
                    domainPrefix: 'banca-internet-beta',
                },
                api: {
                    ...baseConfig.api,
                    stage: 'beta',
                },
                dynamodb: {
                    accountsTableName: 'banca-accounts-beta',
                    transactionsTableName: 'banca-transactions-beta',
                    idempotencyTableName: 'banca-idempotency-beta',
                    usersTableName: 'banca-users-beta',
                },
            };
        case 'prod':
            return {
                ...baseConfig,
                environment: 'prod',
                cognito: {
                    ...baseConfig.cognito,
                    domainPrefix: 'banca-internet-prod',
                },
                api: {
                    ...baseConfig.api,
                    stage: 'prod',
                },
                dynamodb: {
                    accountsTableName: 'banca-accounts-prod',
                    transactionsTableName: 'banca-transactions-prod',
                    idempotencyTableName: 'banca-idempotency-prod',
                    usersTableName: 'banca-users-prod',
                },
                monitoring: {
                    logRetentionDays: 90,
                    alarmThresholdErrors: 5,
                    alarmThresholdLatency: 1000,
                },
            };
        default:
            return {
                ...baseConfig,
                environment: 'demo',
            };
    }
}
exports.getConfig = getConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLWVudi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbmZpZy1lbnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBa0RBLFNBQWdCLFNBQVMsQ0FBQyxXQUFtQjtJQUMzQyxNQUFNLFVBQVUsR0FBaUM7UUFDL0MsV0FBVyxFQUFFLGdCQUFnQjtRQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksV0FBVztRQUM3QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSxFQUFFO1FBQzlFLE9BQU8sRUFBRTtZQUNQLFlBQVksRUFBRSxxQkFBcUI7WUFDbkMsU0FBUyxFQUFFLDJCQUEyQjtZQUN0QyxVQUFVLEVBQUUsSUFBSTtTQUNqQjtRQUNELEdBQUcsRUFBRTtZQUNILEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxXQUFXLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSx3QkFBd0IsRUFBRSx1QkFBdUIsRUFBRSx3QkFBd0IsRUFBRSx1QkFBdUIsRUFBRSx3QkFBd0IsQ0FBQztTQUN2SztRQUNELFFBQVEsRUFBRTtZQUNSLGlCQUFpQixFQUFFLGdCQUFnQjtZQUNuQyxxQkFBcUIsRUFBRSxvQkFBb0I7WUFDM0Msb0JBQW9CLEVBQUUsbUJBQW1CO1lBQ3pDLGNBQWMsRUFBRSxhQUFhO1NBQzlCO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsVUFBVSxFQUFFLEdBQUc7WUFDZixTQUFTLEVBQUUsSUFBSTtZQUNmLFNBQVMsRUFBRSxHQUFHO1NBQ2Y7UUFDRCxVQUFVLEVBQUU7WUFDVixnQkFBZ0IsRUFBRSxFQUFFO1lBQ3BCLG9CQUFvQixFQUFFLEVBQUU7WUFDeEIscUJBQXFCLEVBQUUsSUFBSTtTQUM1QjtRQUNELFFBQVEsRUFBRTtZQUNSLEdBQUcsRUFBRSx1QkFBdUI7WUFDNUIsTUFBTSxFQUFFLGdCQUFnQjtTQUN6QjtLQUNGLENBQUM7SUFFRixRQUFRLFdBQVcsRUFBRTtRQUNuQixLQUFLLEtBQUs7WUFDUixPQUFPO2dCQUNMLEdBQUcsVUFBVTtnQkFDYixXQUFXLEVBQUUsS0FBSztnQkFDbEIsT0FBTyxFQUFFO29CQUNQLEdBQUcsVUFBVSxDQUFDLE9BQVE7b0JBQ3RCLFlBQVksRUFBRSxvQkFBb0I7aUJBQ25DO2dCQUNELEdBQUcsRUFBRTtvQkFDSCxHQUFHLFVBQVUsQ0FBQyxHQUFJO29CQUNsQixLQUFLLEVBQUUsS0FBSztpQkFDYjtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsaUJBQWlCLEVBQUUsb0JBQW9CO29CQUN2QyxxQkFBcUIsRUFBRSx3QkFBd0I7b0JBQy9DLG9CQUFvQixFQUFFLHVCQUF1QjtvQkFDN0MsY0FBYyxFQUFFLGlCQUFpQjtpQkFDbEM7YUFDcUIsQ0FBQztRQUUzQixLQUFLLE1BQU07WUFDVCxPQUFPO2dCQUNMLEdBQUcsVUFBVTtnQkFDYixXQUFXLEVBQUUsTUFBTTtnQkFDbkIsT0FBTyxFQUFFO29CQUNQLEdBQUcsVUFBVSxDQUFDLE9BQVE7b0JBQ3RCLFlBQVksRUFBRSxxQkFBcUI7aUJBQ3BDO2dCQUNELEdBQUcsRUFBRTtvQkFDSCxHQUFHLFVBQVUsQ0FBQyxHQUFJO29CQUNsQixLQUFLLEVBQUUsTUFBTTtpQkFDZDtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsaUJBQWlCLEVBQUUscUJBQXFCO29CQUN4QyxxQkFBcUIsRUFBRSx5QkFBeUI7b0JBQ2hELG9CQUFvQixFQUFFLHdCQUF3QjtvQkFDOUMsY0FBYyxFQUFFLGtCQUFrQjtpQkFDbkM7YUFDcUIsQ0FBQztRQUUzQixLQUFLLE1BQU07WUFDVCxPQUFPO2dCQUNMLEdBQUcsVUFBVTtnQkFDYixXQUFXLEVBQUUsTUFBTTtnQkFDbkIsT0FBTyxFQUFFO29CQUNQLEdBQUcsVUFBVSxDQUFDLE9BQVE7b0JBQ3RCLFlBQVksRUFBRSxxQkFBcUI7aUJBQ3BDO2dCQUNELEdBQUcsRUFBRTtvQkFDSCxHQUFHLFVBQVUsQ0FBQyxHQUFJO29CQUNsQixLQUFLLEVBQUUsTUFBTTtpQkFDZDtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsaUJBQWlCLEVBQUUscUJBQXFCO29CQUN4QyxxQkFBcUIsRUFBRSx5QkFBeUI7b0JBQ2hELG9CQUFvQixFQUFFLHdCQUF3QjtvQkFDOUMsY0FBYyxFQUFFLGtCQUFrQjtpQkFDbkM7Z0JBQ0QsVUFBVSxFQUFFO29CQUNWLGdCQUFnQixFQUFFLEVBQUU7b0JBQ3BCLG9CQUFvQixFQUFFLENBQUM7b0JBQ3ZCLHFCQUFxQixFQUFFLElBQUk7aUJBQzVCO2FBQ3FCLENBQUM7UUFFM0I7WUFDRSxPQUFPO2dCQUNMLEdBQUcsVUFBVTtnQkFDYixXQUFXLEVBQUUsTUFBTTthQUNHLENBQUM7S0FDNUI7QUFDSCxDQUFDO0FBN0dELDhCQTZHQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgQmFuY2FJbnRlcm5ldENvbmZpZyB7XG4gIC8vIENvbmZpZ3VyYWNpw7NuIGLDoXNpY2FcbiAgcHJvamVjdE5hbWU6IHN0cmluZztcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgcmVnaW9uOiBzdHJpbmc7XG4gIGFjY291bnRJZDogc3RyaW5nO1xuICBcbiAgLy8gQ29uZmlndXJhY2nDs24gZGUgQ29nbml0b1xuICBjb2duaXRvOiB7XG4gICAgZG9tYWluUHJlZml4OiBzdHJpbmc7XG4gICAgZW1haWxGcm9tOiBzdHJpbmc7XG4gICAgbWZhRW5hYmxlZDogYm9vbGVhbjtcbiAgfTtcbiAgXG4gIC8vIENvbmZpZ3VyYWNpw7NuIGRlIEFQSVxuICBhcGk6IHtcbiAgICBzdGFnZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgY29yc09yaWdpbnM6IHN0cmluZ1tdO1xuICB9O1xuICBcbiAgLy8gQ29uZmlndXJhY2nDs24gZGUgRHluYW1vREJcbiAgZHluYW1vZGI6IHtcbiAgICBhY2NvdW50c1RhYmxlTmFtZTogc3RyaW5nO1xuICAgIHRyYW5zYWN0aW9uc1RhYmxlTmFtZTogc3RyaW5nO1xuICAgIGlkZW1wb3RlbmN5VGFibGVOYW1lOiBzdHJpbmc7XG4gICAgdXNlcnNUYWJsZU5hbWU6IHN0cmluZztcbiAgfTtcbiAgXG4gIC8vIENvbmZpZ3VyYWNpw7NuIGRlIHRyYW5zZmVyZW5jaWFzXG4gIHRyYW5zZmVyczoge1xuICAgIGRhaWx5TGltaXQ6IG51bWJlcjtcbiAgICBtaW5BbW91bnQ6IG51bWJlcjtcbiAgICBtYXhBbW91bnQ6IG51bWJlcjtcbiAgfTtcbiAgXG4gIC8vIENvbmZpZ3VyYWNpw7NuIGRlIG1vbml0b3Jlb1xuICBtb25pdG9yaW5nOiB7XG4gICAgbG9nUmV0ZW50aW9uRGF5czogbnVtYmVyO1xuICAgIGFsYXJtVGhyZXNob2xkRXJyb3JzOiBudW1iZXI7XG4gICAgYWxhcm1UaHJlc2hvbGRMYXRlbmN5OiBudW1iZXI7XG4gIH07XG4gIFxuICAvLyBDb25maWd1cmFjacOzbiBkZSBmcm9udGVuZFxuICBmcm9udGVuZDoge1xuICAgIHVybDogc3RyaW5nO1xuICAgIGRvbWFpbjogc3RyaW5nO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKGVudmlyb25tZW50OiBzdHJpbmcpOiBCYW5jYUludGVybmV0Q29uZmlnIHtcbiAgY29uc3QgYmFzZUNvbmZpZzogUGFydGlhbDxCYW5jYUludGVybmV0Q29uZmlnPiA9IHtcbiAgICBwcm9qZWN0TmFtZTogJ2JhbmNhLWludGVybmV0JyxcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkFXU19SRUdJT04gfHwgJ3VzLWVhc3QtMScsXG4gICAgYWNjb3VudElkOiBwcm9jZXNzLmVudi5BV1NfQUNDT1VOVF9JRCB8fCBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5UIHx8ICcnLFxuICAgIGNvZ25pdG86IHtcbiAgICAgIGRvbWFpblByZWZpeDogJ2JhbmNhLWludGVybmV0LWRlbW8nLFxuICAgICAgZW1haWxGcm9tOiAnbm9yZXBseUBiYW5jYWludGVybmV0LmNvbScsXG4gICAgICBtZmFFbmFibGVkOiB0cnVlLFxuICAgIH0sXG4gICAgYXBpOiB7XG4gICAgICBzdGFnZTogJ3Byb2QnLFxuICAgICAgZGVzY3JpcHRpb246ICdCYW5jYSBwb3IgSW50ZXJuZXQgQVBJJyxcbiAgICAgIGNvcnNPcmlnaW5zOiBbJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3MycsICdodHRwczovL2xvY2FsaG9zdDo1MTczJywgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3NCcsICdodHRwczovL2xvY2FsaG9zdDo1MTc0JywgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsICdodHRwczovL2xvY2FsaG9zdDozMDAwJ10sXG4gICAgfSxcbiAgICBkeW5hbW9kYjoge1xuICAgICAgYWNjb3VudHNUYWJsZU5hbWU6ICdiYW5jYS1hY2NvdW50cycsXG4gICAgICB0cmFuc2FjdGlvbnNUYWJsZU5hbWU6ICdiYW5jYS10cmFuc2FjdGlvbnMnLFxuICAgICAgaWRlbXBvdGVuY3lUYWJsZU5hbWU6ICdiYW5jYS1pZGVtcG90ZW5jeScsXG4gICAgICB1c2Vyc1RhYmxlTmFtZTogJ2JhbmNhLXVzZXJzJyxcbiAgICB9LFxuICAgIHRyYW5zZmVyczoge1xuICAgICAgZGFpbHlMaW1pdDogNTAwLFxuICAgICAgbWluQW1vdW50OiAwLjAxLFxuICAgICAgbWF4QW1vdW50OiA1MDAsXG4gICAgfSxcbiAgICBtb25pdG9yaW5nOiB7XG4gICAgICBsb2dSZXRlbnRpb25EYXlzOiAzMCxcbiAgICAgIGFsYXJtVGhyZXNob2xkRXJyb3JzOiAxMCxcbiAgICAgIGFsYXJtVGhyZXNob2xkTGF0ZW5jeTogMjAwMCxcbiAgICB9LFxuICAgIGZyb250ZW5kOiB7XG4gICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjUxNzMnLFxuICAgICAgZG9tYWluOiAnbG9jYWxob3N0OjUxNzMnLFxuICAgIH0sXG4gIH07XG5cbiAgc3dpdGNoIChlbnZpcm9ubWVudCkge1xuICAgIGNhc2UgJ2Rldic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5iYXNlQ29uZmlnLFxuICAgICAgICBlbnZpcm9ubWVudDogJ2RldicsXG4gICAgICAgIGNvZ25pdG86IHtcbiAgICAgICAgICAuLi5iYXNlQ29uZmlnLmNvZ25pdG8hLFxuICAgICAgICAgIGRvbWFpblByZWZpeDogJ2JhbmNhLWludGVybmV0LWRldicsXG4gICAgICAgIH0sXG4gICAgICAgIGFwaToge1xuICAgICAgICAgIC4uLmJhc2VDb25maWcuYXBpISxcbiAgICAgICAgICBzdGFnZTogJ2RldicsXG4gICAgICAgIH0sXG4gICAgICAgIGR5bmFtb2RiOiB7XG4gICAgICAgICAgYWNjb3VudHNUYWJsZU5hbWU6ICdiYW5jYS1hY2NvdW50cy1kZXYnLFxuICAgICAgICAgIHRyYW5zYWN0aW9uc1RhYmxlTmFtZTogJ2JhbmNhLXRyYW5zYWN0aW9ucy1kZXYnLFxuICAgICAgICAgIGlkZW1wb3RlbmN5VGFibGVOYW1lOiAnYmFuY2EtaWRlbXBvdGVuY3ktZGV2JyxcbiAgICAgICAgICB1c2Vyc1RhYmxlTmFtZTogJ2JhbmNhLXVzZXJzLWRldicsXG4gICAgICAgIH0sXG4gICAgICB9IGFzIEJhbmNhSW50ZXJuZXRDb25maWc7XG5cbiAgICBjYXNlICdiZXRhJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmJhc2VDb25maWcsXG4gICAgICAgIGVudmlyb25tZW50OiAnYmV0YScsXG4gICAgICAgIGNvZ25pdG86IHtcbiAgICAgICAgICAuLi5iYXNlQ29uZmlnLmNvZ25pdG8hLFxuICAgICAgICAgIGRvbWFpblByZWZpeDogJ2JhbmNhLWludGVybmV0LWJldGEnLFxuICAgICAgICB9LFxuICAgICAgICBhcGk6IHtcbiAgICAgICAgICAuLi5iYXNlQ29uZmlnLmFwaSEsXG4gICAgICAgICAgc3RhZ2U6ICdiZXRhJyxcbiAgICAgICAgfSxcbiAgICAgICAgZHluYW1vZGI6IHtcbiAgICAgICAgICBhY2NvdW50c1RhYmxlTmFtZTogJ2JhbmNhLWFjY291bnRzLWJldGEnLFxuICAgICAgICAgIHRyYW5zYWN0aW9uc1RhYmxlTmFtZTogJ2JhbmNhLXRyYW5zYWN0aW9ucy1iZXRhJyxcbiAgICAgICAgICBpZGVtcG90ZW5jeVRhYmxlTmFtZTogJ2JhbmNhLWlkZW1wb3RlbmN5LWJldGEnLFxuICAgICAgICAgIHVzZXJzVGFibGVOYW1lOiAnYmFuY2EtdXNlcnMtYmV0YScsXG4gICAgICAgIH0sXG4gICAgICB9IGFzIEJhbmNhSW50ZXJuZXRDb25maWc7XG5cbiAgICBjYXNlICdwcm9kJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmJhc2VDb25maWcsXG4gICAgICAgIGVudmlyb25tZW50OiAncHJvZCcsXG4gICAgICAgIGNvZ25pdG86IHtcbiAgICAgICAgICAuLi5iYXNlQ29uZmlnLmNvZ25pdG8hLFxuICAgICAgICAgIGRvbWFpblByZWZpeDogJ2JhbmNhLWludGVybmV0LXByb2QnLFxuICAgICAgICB9LFxuICAgICAgICBhcGk6IHtcbiAgICAgICAgICAuLi5iYXNlQ29uZmlnLmFwaSEsXG4gICAgICAgICAgc3RhZ2U6ICdwcm9kJyxcbiAgICAgICAgfSxcbiAgICAgICAgZHluYW1vZGI6IHtcbiAgICAgICAgICBhY2NvdW50c1RhYmxlTmFtZTogJ2JhbmNhLWFjY291bnRzLXByb2QnLFxuICAgICAgICAgIHRyYW5zYWN0aW9uc1RhYmxlTmFtZTogJ2JhbmNhLXRyYW5zYWN0aW9ucy1wcm9kJyxcbiAgICAgICAgICBpZGVtcG90ZW5jeVRhYmxlTmFtZTogJ2JhbmNhLWlkZW1wb3RlbmN5LXByb2QnLFxuICAgICAgICAgIHVzZXJzVGFibGVOYW1lOiAnYmFuY2EtdXNlcnMtcHJvZCcsXG4gICAgICAgIH0sXG4gICAgICAgIG1vbml0b3Jpbmc6IHtcbiAgICAgICAgICBsb2dSZXRlbnRpb25EYXlzOiA5MCxcbiAgICAgICAgICBhbGFybVRocmVzaG9sZEVycm9yczogNSxcbiAgICAgICAgICBhbGFybVRocmVzaG9sZExhdGVuY3k6IDEwMDAsXG4gICAgICAgIH0sXG4gICAgICB9IGFzIEJhbmNhSW50ZXJuZXRDb25maWc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uYmFzZUNvbmZpZyxcbiAgICAgICAgZW52aXJvbm1lbnQ6ICdkZW1vJyxcbiAgICAgIH0gYXMgQmFuY2FJbnRlcm5ldENvbmZpZztcbiAgfVxufVxuIl19
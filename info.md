
- search under drop down [done]
- service name size dynamic [done]
- download option for reduced logs [done]
- filter error logs - default [done]
- in logs search [done]
- log search optimisation (useMemo react hook) [done]
- display original logs or direct link to logman [done]
- inform users only 5000 when capped [done]
- from start time - direction [done]
- give reduction rate as user param [done]
- quick time select [done]
- wrap around logs [done]

- 0 logs and loki down error handling (overall better error handling) [done]

- user management system
     - cognito setup [done]
     - amazon-cognito-management-js setup [done]
     - login and signup workflow and pages [done]
     - user session management [done]
     - otp email confirmation workflow [done]
     - bearier tokens embed with all backend requests [done]
     - secure backend endpoints with cognito jwt tokens [done]
     - resolve user and session validity on decoding jwt in backend [done]
     - menu auth routes secure & selected item bug fix [done]
     - aws sso integration
          - identity provider setup [done]
          - cognito attribute mapping [done]
          - sso callback workflow [done]
          - sso support backend [done]
     - auth navigation flow

- logo white labelling [done]
- beta onetime popup banner and beta tags [done]
- loading page [done]
- 404 page [done]
- sso hosted ui logo embed [done]
- progress step updates from backend - SSE methodology [done]

- bedrock setup [done]
- build rag pipeline [done]
- ui for summary [done]
- scroll to bottom on log fetch [done]
- logs full screen feature [done]
- AI usage info - bottom note [done]
- summary history [done]
- can we also remove the /n from the end and also see if we can present count better? [done]
- false positive error - no logs found - (n vs n) log num original logs [done]
- user quota block [done]
- last 10 mins [done]

- quick select up, time range down (less overwelming) [done]
- time name short [done]
- better prompt [done]
- more options closed [done] [reverted] [done]
- delete manual policy and add managed policy to new cluster role [done]
- Reduction rate info notificaiton on fetch [done]
- flash logrctx ai button longer time [done]
- about page - wiki [done]
- migrate to new logman v2 [done]
- service only, pod less picking [done]
- default 5 mins [done]
- hilight selected quick time range [done]
- view raw logs -> url construction -> logmanv2 compatibility [done]   

- step logs feature [nf]

- Keep only SSO - hidden manual login endpoint for dev [done]
- More free buffer tokens for response [done]
- get param using url [done]
- 5k -> 10k [done]
- onboard logs to logman and monitoring metrics [done]


- remove pod in hostory page [done]

- migrate normal summaries from mistral 7b to mistral 8x7b [done]
- comparative rag between logs (mistral large) [done]
- prompt optimise for mistral 7*8b [done]
- storage logic update for comparative analysis [done]

- error logs while fetching [done] [disabled]
- complete api support (token gen, wiki, backend updates) [done]
- ads dsp canary service add (all services not showing) [done]
- confirmation before rag when logs are more than 100 (long notifiation) [done]

-------------------------------------------------

- explore [logai](https://github.com/salesforce/logai) (shouldn't be a question on this) [dome]
- prompt edit fix [done]
- sort logs and tabular content [done]
- loki time out error with retry logic [done]



- longer period time comparative analysis (listen to rec)
    - take logs in chunk, drain, extract patterns and store.
    - then do the same wth another time and compare the patterm
    - llm analysis on this comparitive pattern
    - stocasticity (there are some ways to fix this too)

- estimate time counter
- persisting logs and insights on page switching

- optimize logging
- step retrieval automate async queue ( see loki logs if err )
- automatic codebuild -> ecr migration

----- from salesforce/logai -------

- log stats graph
- log clustering (algo options)

----- not doing now -------

- logman dahsboard for logrctx
- generate link - grafana plugin for logrctx connection

----------------------------------


# insights

- interocitor [done]
- dash-cart [done]
- gandalf [done]
- dash-orderability [done]
- payment-presentation-service [done]
- dash-data-source [done]
- dash-enrichment-service 2.35 TB [done]
- core-pricing-service 1.93 TB [done]
- ads-serving [done]
- offer-server 1.75 TB [done]









------------------------------
shuttle api user creds

username: shuttle-user@logrctx.swiggyops.de
password: @w5720F9Ik32#
api token: eyJraWQiOiJnOUtuUTVtVTB2VVdmYWdHN3hwTzRTR0F4V2prRUd1RDNvRWtoYTBnOXZBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0OWVhZDUwYy01MDcxLTcwMWEtZThmYS1jZTU0YzdkOTljZDAiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC0xLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC0xX2NySkJRN3lvNiIsImNvZ25pdG86dXNlcm5hbWUiOiI0OWVhZDUwYy01MDcxLTcwMWEtZThmYS1jZTU0YzdkOTljZDAiLCJvcmlnaW5fanRpIjoiYzIyYWQ5NjgtODE5Ni00MGNlLThiODQtMDU3MWFjNDlmZjhiIiwiYXVkIjoiNGtxaWwyN3E0ZGNpZWxyM3ZiZHFxZW1rbTUiLCJldmVudF9pZCI6IjkxZTgzMDgwLWVhNzctNGMwZi1iMGNjLTEyOWM2ZTJhZDZkZiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzI2Mzk1MjIxLCJleHAiOjE3MjY0ODE2MjEsImlhdCI6MTcyNjM5NTIyMSwianRpIjoiZGU3NDc2ZWMtOWQzMS00YzM5LTg5OGYtM2U2NmFlYzY0YjVmIiwiZW1haWwiOiJzaHV0dGxlLXVzZXJAbG9ncmN0eC5zd2lnZ3lvcHMuZGUifQ.FCFKhDHCFSvsMrBnE7F6-6u8YLfPavez9twv_uc4DKESMiixgphvHfoFV4NHAdRA9NYEDsHhuLA4tyVEh84Gi1_vnPgsCeEm8EvKoJlal_V0BODXwW7myAGYvbrQkjIubxIpSkicqOwsyZgW13GPdoaHeDFjPa9pp0hIF0wXK7Gm_MwY8w29GEUgjjfVsBbF55u-wfOhGfa-NY0J1ZKCmGC9-E-x8Q5Grm0EIgqupqJnH3UYhuqTBIyrceu578Xx-kkLjiv0NLTF36A1kUCFt5omfcIoo03zBdmGEkCZ7K_z0e8-raovtxqxQu8MTczupxF_WSW5ffeStUT4Q1EA8w|eyJraWQiOiJyVU10YTNleVNteUtVSXBrM2ZiTXM1dDJtWWJnc1NSbVdSTUFZWFFcL3hQcz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0OWVhZDUwYy01MDcxLTcwMWEtZThmYS1jZTU0YzdkOTljZDAiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTFfY3JKQlE3eW82IiwiY2xpZW50X2lkIjoiNGtxaWwyN3E0ZGNpZWxyM3ZiZHFxZW1rbTUiLCJvcmlnaW5fanRpIjoiYzIyYWQ5NjgtODE5Ni00MGNlLThiODQtMDU3MWFjNDlmZjhiIiwiZXZlbnRfaWQiOiI5MWU4MzA4MC1lYTc3LTRjMGYtYjBjYy0xMjljNmUyYWQ2ZGYiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzI2Mzk1MjIxLCJleHAiOjE3MjY0ODE2MjEsImlhdCI6MTcyNjM5NTIyMSwianRpIjoiZjZkMjM5YWUtYzIwZC00MWFiLTkwYTMtZDc1OWU3YmIyNWIzIiwidXNlcm5hbWUiOiI0OWVhZDUwYy01MDcxLTcwMWEtZThmYS1jZTU0YzdkOTljZDAifQ.g__a68MIbPl91BlSNIclWJpabMUdLlYtz4sgmrWEw0a4BWOIcy02KqOnRILnLbt2onNEySmsnwSMOk-YOLDzWBC7Fsu3-i6xVvl8ITobjcOUw7G6mUwaZrwvLslHlJwrXZNOEQbTgtuFGkN08ie-jwd9PTvFCP5s4YPS44gfRiv0Q7qYSHYG5jVTkgghh5cmvupz1qq_T_U1Zc-kiNiUHeHuQDKw5FBZrR19U8YvH9-_MpCa6uJQvcsk-exx--gV2LeTyZNuLmZEyZ8WG6POG6BXNLip95NM5sdtXo-LizeOLrpPpcc5MRoc1MzPbINugceAKx02zi_Ard5jrybFuA


-------------------------------------------------------------------------------------------------------------------------------------------------
Mistral models	        Price per 1,000 input tokens	Price per 1,000 output tokens   Average            For Tokens
Mistral 7B (32k)	        $0.00018	                $0.00024                $0.00021            $0.00672 (32k) 0.56 inr
Mixtral 8*7B(32k)	        $0.00054	                $0.00084                $0.00069            $0.02208 (32k) 1.8 inr
Mistral Large 2               	$0.0048	                        $0.0144                 $0.0098             $0.6272  (64k) 52 inr

-------------------------------------------------------------------------------------------------------------------------------------------------
Practical calculation for Mistral 7b (regular rag summary)

Input tokens = 25k tokens -> 25*0.00018 = 0.0045usd = 0.37 inr
Output tokens = 7k tokens -> 7*0.00024 = 0.00168usd = 0.1 inr

0.37 + 0.1 = 0.47 inr per invocation
-------------------------------------------------------------------------------------------------------------------------------------------------
Practical calculation for Mistral 8*7b (regular rag summary)

Input tokens = 25k tokens -> 25*0.00054 = 0.0135usd = 1.13 inr
Output tokens = 7k tokens -> 7*0.00084 = 0.00588usd = 0.5 inr

1.13 + 0.5 = 1.63 inr per invocation
-------------------------------------------------------------------------------------------------------------------------------------------------
Practical calculation for Mistral Large 2 (dual canary input)

Input tokens = max 65k tokens   ->  65*0.0048 = 0.312usd = 26inr
Output tokens = max 10k tokens  ->  10*0.0144 = 0.144usd = 12inr

26 + 12 = 38 inr per invocation
--------------------------------------------------------------------------------------------------------------------------------------


❯ kubectl port-forward -n logman svc/loki-query-frontend 3100:3100

❯ aws ssm start-session --target i-0508f01437b7c9158 --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["3100"],"localPortNumber":["3100"]}' --region ap-southeast-1

------

# shuttle ecr login
❯ aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 157529275398.dkr.ecr.ap-southeast-1.amazonaws.com

# build and push backend
❯ docker buildx build --push --platform linux/arm64 -t 157529275398.dkr.ecr.ap-southeast-1.amazonaws.com/logrctx/backend:latest .

# build and push frontend
❯ docker buildx build --push --platform linux/arm64 -t 157529275398.dkr.ecr.ap-southeast-1.amazonaws.com/logrctx/frontend:latest .

---------------------

Time out issue
    - not with client app (backend time out error)
    - not with backend (working locally, most request works)
        - if so, it could be uvicorn handling parallel requests probably ? (have to check this)
    - not resource limits. It's reduced but still occurs in little amount
    - most probably it's k8s. 
        - suspecting request going to some pods are not taken in or responded. seeing some idle pods (have to check this)
        - probably by targetting all request to specific pod and checking one by one
    - not loki. works when hit same endpoint from local
        - but sometimes even from local (loki-pignator) querier hangs indifinetly (check this)
    - api works when restarted for sometime and issue resumes after some quests [this is the issue]
        - could be loki timeput isn't cascaded and all pod goes into wait state one by one (possible theory)
        - custom timeout btw loki and backend could fix this
    - file rca maybe


```
POST https://logrctx-api.swiggyops.de/reduce net::ERR_FAILED 504 (Gateway Timeout)
```






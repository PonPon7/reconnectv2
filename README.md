## Re-Connect V2 - Project Overview

Re-Connect is a full-stack Web Application with a combination of React, Python ML scripts, Django, javascript, CSS & Tailwind - 
It is designed on an Architecture which allows start-ups to host with absolute minimal cost a Full Web Application with Database storage and good performance.
Leveraging components as safe-exchange of SQLite databases & retrieving to sync - using Google & Env Secrets - it showcases how to implement & host a Production App for small scale,
And prepares the ground for safer, smooth scaling once the demand of users & computational power increases.

### Main Components:

## I. Online Course Landing Page
### The Secrets Of the Alchemy
RO/EN Versions of Online Course Landing page.
Contains combinations of self-generated CSS & JS animations - together with leveraging popular modern libraries - All customized towards Website's Theme.  


## II. Project YLF
Starting point is the Stand-Alone Python app [href]YLF.
This has been integrated in this Web App's Framework to properly match business needs & Context.
LLM Trained on Processed Company's dataset, integrated in multi-agent orchestration pipeline for rating & processing.
Architecture: Trained Model Receives prompt and answer.
First-layer LLM: Considering user prompt, rates Model's Answers on different dimensions such as Safety, Context Awareness, Helping sentiment.
If Scoring is below threshold - calls again YLF Model - until either threshold or attempts limit is met.
Second-Layer LLM: Final Review & Markdown formatting of response.

Friendly-UI, smooth experience on both PC & Mobile.
RLHF Integration:
Each Response can be flagged as innapropriate/unsatisfacatory. 
If user clicks, he is also presented with the option to provide more complex feedback which is gathered and later used for RLHF on future Models.
If user enters feedback workflow - he is presented with YLF Feedback Modal - A mediumly complex LLM rating form built on multiple Rating Dimensions & Justifications & Expected Response.


III. Food Prophet
Stand-Alone React application built & Deployed in Django framework.
[href]github.com
ML Model developed on Dataset analysis & probabilistic distribution towards accurately Simulating an Archtype(person specific body&lifestyle) Digestion.
React graph continous representation & Responsiveness, allowing async manipulation of Time Dimensions or Custom Meals.
Also offers possibility to Simulate an Empty Archtype and Manually simulate.
Built upon syncronized multiple Web Workers.

IV. Bibliography



**Install requirements**
python 
```
pip install -r requirements.txt
```

**Environment Requirements**
*Variables:*
Open AI Key - OPENAI_API_KEY
Secret key used for fetching database from cloud - SECRET_KEY_DB_EXPORT
For Django Email-Exchange User-submitted form - EMAIL_HOST_USER & EMAIL_HOST_PASSWORD

**If planning on local development env, you're all set up!**


**Deployment Requirements**
###Current Architecture deploys the app on Google Cloud AppEngine, Firebase for storing user models data, Internal Pipeline for sync-inc Databases.
##This allows a safe & smooth UX availability for low to medium scaling.
Once the App scales, consider changing database to a Server-Side one.

app.yaml - Gcloud deployment file. Load needed environment variables here or set up using Google Secrets.
entrypoint Scripts - This script will run as soon as app is deployed. In the current framework of continous dbsql lite deployment and sync,
we are using "./startup.sh" to sync the databases & start web app using Gunicorn.


**We're all set up**
Checkout before merge



***Contributions are welcomed but noted that contributions related to YLF and Food Prophet should be done in their stand-alone repos***
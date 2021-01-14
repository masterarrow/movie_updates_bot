#### Deploy on Heroku

Build the app:

`yarn run build`

In terminal run the next commands:

`$ cd dist/`

`$ git init`

`$ git add .`

`$ git commit -m "Commit"`

`$ heroku create (or heroku git:remote -a <heroku_address>)`

`$ git push heroku master`

Setup environment variables (see [README.md](/README.md) )

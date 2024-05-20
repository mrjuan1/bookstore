# Bookstore

A small API to manage books, their authors and genres and calculate discounts on genre bundles.

## Notes

This was all written and configured from the ground-up in about three days as an assignment. I've never built an API from the ground-up before, this this was a first for me.

I sadly ended up wasting a lot of time on setup, configuration, validation, documentation and unit tests, leaving the endpoints for last when there was very little time left. So unfortunately those aren't in the best condition, but the rest of the application's data handling and unit tests should be quite good.

TL;DR Setup:

```sh
git clone https://github.com/mrjuan1/bookstore
cd bookstore
npm i
cp .env.example .env
npm run checks # Does formatting, type-checking, linting and runs the init tests

# Next, get a PostgreSQL server up-and-running and have its root user's password handy
./db/setup.sh
npm run migrations:run
npm start

# Add some books and get their genre's total discount
curl -X POST -H "Content-Type: application/json" -d '{"name":"Book A","author":"Mr Book Person","genre":"Fantasy","price":250}' -i localhost:3000/books
curl -X POST -H "Content-Type: application/json" -d '{"name":"Book B","author":"Mr Book Person","genre":"Fantasy","price":250}' -i localhost:3000/books
curl -i 'localhost:3000/discount?genre=Fantasy&discount=10'
# Should return a total discount of 450 (250 + 250 = 500, 10% of 500 is 50, sub 50 from 500 and get 450)
```

See below for more detailed information on each part of this repository.

## Requirements

To run and build the project, NodeJS and NPM are required. Not tested with Yarn and Bun, some changes to `package.json` might be required for these _(will test and update later)_.

NodeJS LTS v20.x was used as of writing this, but earlier versions down to v16 should work just fine too. Again, not tested with Bun, might or might not work _(will test and update later)_.

For the DB, this application is built with PostgreSQL as the main DB in mind. MySQL or MariaDB might work as well _(will test and update later)_, but you're on your own if you decide to use those or any others _(might test a few others and update later)_.

## Setup

The following steps are required initially as preparation for the application to be able to run or build.

### Database and dependencies

Make sure your database server is up-and-running.

Then run the following to install the required dependencies:

```sh
npm install # or npm i for short
```

### Environment variables

Next, copy the `.env.example` file to `.env`:

```sh
cp .env.example .env
```

Open `.env` in an editor of your choice and update the values there to suit your needs.

If you're using PostgreSQL, the defaults should be fine without any changes are required.

### Database configuration

Inside the `db` directory is a script called `setup-db.sh`. This script assumes your DB's root user is called "root". If it isn't, you can specify a different root username.

That being said, you can run the script in one of the following two ways:

```sh
db/setup-db.sh # assumes "root" as the DB's root user
# ...or...
db/setup-db.sh admin # uses "admin" as the DB's root user, for example
```

This script makes use of the values in the `.env` file to set things up.

If you're running PostgreSQL, you'll be prompted for the DB's root user's password. The script will then create a user for migrations with the appropriate access as well as a database owned by the migrations user.

Additionally, if you ever want completely undo the changes made by this script, you can run the script as follows:

```sh
db/setup-db.sh -c
# ...or...
db/setup-db.sh -c "your-db-root-user"
```

If you're not running PostgreSQL, the script will give instructions of what you'll need to do to setup the migrations user and the database yourself on the DB of your choice.

### Migrations

The DB migrations are located in `db/migrations`. These files make use of the migrations user to setup an API user, all the required tables and their relations, as well as the appropriate permissions for the API user.

The migrations can be run with the following command:

```sh
npm run migrations:run
```

Additionally, you can revert (undo) these migrations one-by-one with the following command:

```sh
npm run migrations:revert
```

To revert all migrations, keep running until it says there's nothing left to revert.

## Running

The application can be started with the following command:

```sh
npm start
```

This will start a very simple dev server that will watch for code changes and restart if any are detected in any typescript file or in your `.env` file.

## Code checking

There are various node scripts defined in `package.json` for formatting code, type-checking and linting. The rules for each of these are quite strict to enforce better practices.

The following commands are available to use for code checking:

```sh
# Will format the entire code base using Prettier
npm run format

# Will perform type-checking on all .ts files using tsc
npm run type-check

# Will lint check the entire code base using eslint and some typescript-specific plugins
npm run lint

# Will do all the above in that specified order, followed by running tests (see below)
npm run checks
```

### Tests

Tests can be run with one of the following commands:

```sh
# Runs all tests once-off
npm test

# Watches for changes to related files and automatically re-runs tests if any changes are detected
npm run test:watch
```

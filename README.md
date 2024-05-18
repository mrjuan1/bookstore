# Bookstore

A small API to manage books, their authors and genres and calculate discounts on genre bundles.

## Requirements

To run and build the project, NodeJS is required (v20+ as of writing this, but earlier versions down to v16 should work just fine too) with NPM. Yarn can probably be used too, but it's not what the project was developed with. Same goes for Bun.

For the DB, this application is built with PostgreSQL as the main DB in mind. MySQL or MariaDB might work as well, but you're on your own if you decide to use those or any others.

## Setup

The following steps are required initially as preparation for the application to be able to run or build.

### Dependencies

Run `npm i` to install the required dependencies. As mentioned above, Yarn or Bun can be used too, but the application wasn't developed with these in mind.

### Database server

Make sure your DB of choice is up-and-running.

### Environment variables

Next, copy the `.env.example` file to `.env`. Open `.env` in an editor of your choice and update the values there to suit your needs. If you're using PostgreSQL as your DB of choice, the defaults should be fine and no changes are required.

### Database configuration

Inside the `db` directory is a script called `setup-db.sh`. This script assumes your DB's root user is called "root". If it isn't, you can specify a different root username. That being said, you can run the script in one of the following two ways:

```sh
db/setup-db.sh # assumes "root" as the DB's root user
# ...or...
db/setup-db.sh admin # uses "admin" as the DB's root user
```

If you're running PostgreSQL, you'll be prompted for the DB's root user's password. The script will then create a user for migrations with the appropriate access as well as a database owned by the migrations user.

This script makes use of the values in the `.env` file to set things up.

Additionally, if you ever want completely undo the changes made by this script, you can run the script as follows:

```sh
db/setup-db.sh -c # assumes "root" as the DB's root user
# ...or...
db/setup-db.sh -c admin # uses "admin" as the DB's root user
```

If you're not running PostgreSQL, the script will give instructions of what you'll need to do to setup the migrations user and database yourself on the DB of your choice.

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

This will start a very simple dev server that will watch for code changes and restart if any are detected.

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

# Will do all the above in that specified order
npm run checks
```

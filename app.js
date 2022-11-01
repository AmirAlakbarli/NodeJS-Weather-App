const yargs = require("yargs");
const inquirer = require("inquirer");
const Table = require("cli-table");
const axios = require("axios");

yargs
  .command({
    command: "show-country",
    describe: "Get capital city of specific country",

    builder: {
      name: {
        describe: "Enter the name of the country",
        demandOption: true,
      },
    },

    handler: async (arg) => {
      const { data } = await axios({
        method: "post",
        url: `https://countriesnow.space/api/v0.1/countries/capital`,
        data: {
          country: `${arg.name}`,
        },
      });

      const capitalName = data.data.capital;

      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${capitalName}&appid=ef0f255f798f14f55618d5016f0e13fe&units=${
          arg.f ? "imperial" : "metric"
        }`
      );
      const capitalData = await res.data;

      var table = new Table({
        head: ["Country", "City", "Temperature", "Feels like"],
        colWidths: [25, 25, 25, 25],
      });

      table.push([
        arg.name,
        capitalName,
        capitalData.main.temp,
        capitalData.main.feels_like,
      ]);
      console.info(table.toString());
    },
  })

  .command({
    command: "show-city",
    describe: "Get all cities of specific country",

    builder: {
      country: {
        describe: "Enter the name of the country where city is in",
        demandOption: true,
      },
    },

    handler: async (arg) => {
      const { data } = await axios({
        method: "post",
        url: `https://countriesnow.space/api/v0.1/countries/cities`,
        data: {
          country: `${arg.country}`,
        },
      });
      inquirer
        .prompt([
          {
            type: "list",
            name: "city",
            message: "City:",
            choices: data.data,
          },
        ])
        .then(async (answers) => {
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${
              answers.city
            }&appid=ef0f255f798f14f55618d5016f0e13fe&units=${
              arg.f ? "imperial" : "metric"
            }`
          );
          const cityData = await res.data;

          var table = new Table({
            head: ["Country", "City", "Temperature", "Feels like"],
            colWidths: [25, 25, 25, 25],
          });

          table.push([
            arg.country,
            answers.city,
            cityData.main.temp,
            cityData.main.feels_like,
          ]);
          console.info(table.toString());
        });
    },
  })
  .help().argv;

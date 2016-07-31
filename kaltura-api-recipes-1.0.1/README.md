# LucyBot recipes for the Kaltura API

This repository drives the Kaltura Code Recipes and API Console available at [developer.kaltura.org](https://developer.kaltura.org).  The goal is to help educate developers and clients of the Kaltura API on it's wide range of functionality, as well as provide sample code for getting started quickly.

This project utilizes LucyBot's [code generation
system](https://github.com/bobby-brennan/lucy-codegen) and [automated API console](https://github.com/lucybot/lucy-console)


## Installation
You need to have NodeJS 4.0 or above installed.

```bash
git clone https://github.com/kaltura/kaltura-api-recipes.git && cd kaltura-api-recipes
npm install
```

If you intend to add or update recipes and push them to the repo, you will also need to:
```
$ git clone https://github.com/kaltura/kaltura-api-codegen
cd /path/to/local/clone/of/kaltura-api-codegen
# npm link
cd kaltura-recipes
npm link kaltura-codegen
```

This will create:
```
/path/to/local/clone/of/kaltura-recipes/node_modules/kaltura-codegen -> /usr/local/lib/node_modules/kaltura-codegen
/usr/local/lib/node_modules/kaltura-codegen -> /path/to/local/clone/of/kaltura-api-codegen/
```


## Startup
### Development Mode
```bash
./scripts/install-dev.sh
export KALTURA_RECIPES_PORT=3000
export DEVELOPMENT=true
export NO_SSL=true
node server.js
```

### Production Mode
```bash
export KALTURA_RECIPES_PORT=443
export KALTURA_SSO_SECRET=""
export SSO_SYNC_URL=""
export KALTURA_SSO_PAYLOAD=""
export GITHUB_CLIENT_ID="your_client_id"
export GITHUB_CLIENT_SECRET="your_client_secret"
export GITHUB_CALLBACK_URL="http://location.of.server/oauth_callback.html"
sudo -E node server.js
```

You can create a GitHub client ID/Secret by visiting your [Settings Page](https://github.com/settings/developers)

You can use packages like [forever](https://www.npmjs.com/package/forever) to keep the service running in the background.

```bash
npm install -g forever
forever start server.js
```

## Testing
The code for each recipe can be generated by running ```npm test```. This will start the server on
port 3334, and generate code for each recipe/language pair. The generated code will checked against
the code in ```test/golden/{language}/{recipe_name}```.

The tests will also run the generated code on port 3333 and check the output of 127.0.0.1:3333/
against golden files in ```test/golden/responses/{language}/{recipe_name}```

Note that in order to run the servers for each language (and therefore the tests), you'll need to have the following installed:
* **Ruby**: gem, bundler, rake
* **NodeJS**: node, npm
* **PHP**: php
* **JavaScript**: php

You can regenerate the golden files by setting

```export WRITE_GOLDEN=true```

and running

```npm test```

You can set the credentials for testing using environment variables:

```export KALTURA_PARTNER_ID=123456```

```export KALTURA_SECRET=abcd1234```
or
```export KALTURA_ADMIN_SECRET=abcd1234```

```export KALTURA_USER_ID=foo@bar.com```

You can also mock the answers that are collected in the Recipe UI forms by setting

```export KALTURA_ANSWERS_FILE=/path/to/answers.json```

Where answers.json is a map from recipe names to answer/value pairs, e.g. 

```json
"analytics": {
  "reportType": "5",
  "fromDay": "2015-07-01",
  "toDay": "2015-07-10",
},
"captions": {
  "entryId": "1_9kdmnhuv",
  "uiConf": 30633631
}
```



To use a different service URL, you can set KALTURA_SERVICE_URL flag:

```export KALTURA_SERVICE_URL=http://my_url.com/```

You can also set this flag before starting the server to point the recipes at your own service URL.

## Overview

This repository contains tutorials - known as recipes - for working with Kaltura's API. The repository is structured as follows:
* ```recipes/``` - a set of JSON objects, each corresponding to a single tutorial.
* ```node_modules/kaltura-codegen/code_templates/``` - Kaltura-specific templates which are passed to the LucyBot code builders.
* ```node_modules/kaltura-codegen/code_templates/views/``` - HTML templates for displaying the results of the API. Views starting with ```Kaltura``` correspond to specific objects in Kaltura's API schema; e.g. ```KalturaMediaEntry.html``` is the HTML for displaying a [KalturaMediaEntry](https://www.kaltura.com/api_v3/testmeDoc/index.php?object=KalturaMediaEntry). Note that files under ```code_templates/views/html/``` are used by default, but can be overriden for a specific language by placing a view with the same filename under ```code_templates/views/language_name``` (e.g. to use the jquery-fileupload library when working in javascript).
* ```node_modules/kaltura-codegen/code_templates/actions/``` - Templates for making calls to the API in different languages. There is a subdirectory for each language.
* ```node_modules/kaltura-codegen/code_templates/generic_actions/``` - There is one template in here for each supported language. These templates are special in that they don't produce working code; rather, they produce the templates that would normally be found in ```code_templates/actions/```. These templates use Kaltura's API Schema to automatically generate action templates.

Other directories control the webserver:
* ```routes/``` contains a set of Express routers, which control what paths are served by the webserver
* ```views/``` is a set of Jade templates for displaying recipes to the user
* ```static/``` contains CSS, JavaScript, and images, and are served without processing
* ```less/``` contains LESS files for generating CSS
* ```scripts/``` contains helpful scripts for doing things like compiling LESS to CSS
* ```test/``` contains the test files, along with golden files for tracking changes to the generated code.
 
## Adding a New Recipe

Recipes are controlled by the JSON files under ```recipes/```. To add a new recipe, simply create a new JSON file in that directory. JSON is structured as follows:

```json
{
  "name": "the name of this file",
  "title": "the title of the recipe",
  "icon": "the name of a fontawesome icon. Can be any one of those listed in static/bower/fontawesome/scss/_icons.scss",
  "description": "A short description of the recipe",
  "needs_admin": "Set to true if this recipe requires an ADMIN session type",
  "recipe_steps": "this is an array of steps for the recipe, structured as below",
  "recipe_steps": [
    {
      "title": "A title for this step",
      "page": "The index of the Single Page App to show below the recipe (see array 'pages' below)",
      "tip": "The body of text for this recipe. Markdown is supported here so you can [create links](www.google.com) or call out ```snippetsOf.code()```",
      "code_snippet": "The name of a view or action pertinent to this step. This controls what snippet of sample code is displayed to the user",
      "disable_autorefresh": "When set to true, the demo only gets refreshed when you hit 'SendRequest' after filling out the necessary fields. Default is false.",
      "inputs": "An array of HTML inputs to display to the user. Fields entered here can be used in your recipes or embedded in the sample code",
      "inputs": [
        {
          "name": "The programmatic name of the input. Should match propery names in Kaltura's API schema where applicable",
          "default": "The default value to use (optional)",
          "type": "text|textarea|number|radio|select|select-chosen|datetime",
          "label": "A human-readable label for the input (optional, will use 'name' by default)",
          "hidden": "If true, hides this input from the user. Only valid if 'default' is set",
          "choices": "An array of options. Only valid for type = radio|select|select-chosen",
          "choices": [{
            "value": "The value assigned to this field for this choice",
            "label": "A human-readable label for this choice"
          }],
          "dynamic_choices": "Similar to choices, but will use an API call to fill out the list. The API call must return an array",
          "dynamic_choices": {
            "service": "A Kaltura service",
            "action": "An action within that service",
            "map": "Sets value and label from the fields returned by the API",
            "map": {
              "value": "The field to use for the value, e.g. 'id'",
              "label": "The field to use for the label, e.g. 'name'"
            },
            "arguments": "An array of arguments to pass to the API call",
            "arguments": [{
              "class": "A Kaltura class, e.g. KalturaMediaEntryFilter",
              "parameters": "A set of fields to set. Can be constants or user inputs from previous control_steps",
              "parameters": {
                "field_name, e.g. orderBy": "value, e.g. +createdAt",
                "field_name": {"answers": "answerName"}
              }
            }]
          }
        }
      ],
      
    }
  ],
  "pages": "An array of single page apps to generate as part of this recipe. These apps are shown below the recipe instructions and sample code.",
  "pages": [{
    "views": "An array of views that are used in this page. This should contain the view in 'start' below, along with any views they <lucy include> (e.g. KalturaMediaListResponse includes the KalturaMediaEntry view)",
    "views": [
      "myView"
    ],
    "actions": "An array of actions that are used in this page.",
    "actions": [{
      "service": "(optional) The name of a Kaltura service. This allows the action to be auto-generated by the templates in the generic_actions/ directory",
      "action": "The name of the action. Should be the name of a Kaltura action if service is specified",
      "view": "A view for displaying this action's output, e.g. KalturaMediaListResponse for media.list"
    }],
    "start": "The view/action used to start the app",
    "start": {
        "view": "The name of the main view for this recipe, e.g. KalturaMediaListResponse. The view file should reside under code_templates/views/html",
        "data": {
          "action": "The action that supplies the data for the initial load of this page"
        }
    }
  }]
}
```

## Adding a new View

Views are snippets of HTML for displaying responses from the API. Any valid HTML can be used here, including ```<script>``` and ```<style>``` tags.

LucyBot also provides some helper tags:
* Use ```{{ variable.name }}``` to print the value of a given variable
* Use ```<lucy for="thing" in="array">``` to iterate over an array
* Use ```<lucy if="condition">``` to add conditionals
* Use ```<lucy else>``` inside ```<lucy if>``` to add ```else``` blocks
* Use ```<lucy if="result.message && result.code">``` to check for errors and print error messages
* Use ```<lucy include="ViewName">``` to include other views

You have access to two global variables inside of your views:
* ```result``` which is the API's response (but can be overriden via ```<lucy include>```)
* ```answers``` which contains the user's responses from inside the recipe

For example, the following is a valid view:
```html
<h1>Results</h1>
<lucy for="item" in="result">
  <lucy if="item.title == 'foobar'">
    This is a foobar
    <lucy else>
      Unknown title: {{ item.title }}
    </lucy>
  </lucy>
</lucy>
```


```<lucy include>``` can operate in two different ways:

1. It can simply copy the HTML of the included view

2. It can make a new call to the API, and use the included view as a template for displaying the result.

Case (1) is the default behavior. In addition, you can use ```<lucy include="ViewName" resultvar="foo">``` to use variable "foo" in place of API output. For example, since KalturaMediaListResponse is just an array of KalturaMediaEntry, we can have:
```html
<lucy for="video" in="result">
  <lucy include="KalturaMediaEntry" resultvar="video"></lucy>
</lucy>
```

This allows us to use the same KalturaMediaEntry template whether we're using ```media.list``` or ```media.get```.

Case (2) is useful if you need more data from the API. You can specify ```action```, which is the name of the action to use, and ```inputvars``` which is a mapping from variable names to API inputs.

If, for example, KalturaMediaListResponse was just an array of entryIds, we could do:

```html
<lucy for="entryId" in="result">
  <lucy include="KalturaMediaEntry" action="getMedia" inputvars="{id: entryId}"></lucy>
</lucy>
```

## Displaying an XML in the view
Using 3 '{' will cause the XML to display as a string instead of being parsed, like so:
```
{{{ result.xsd }}}
```
For example, see the metadata recipe's view under: code_templates/views/html/metadataShow.html

## Step by step example for adding a new recipe
The sample recipe will accept an entry ID as input and output the entry's name, ID, descrption and number of plays.

The below json file should be placed under the recipes dir

```json
{
    "name": "entry_lookup",
    "title": "Entry Lookup",
    "icon": "search",
    "description": "Learn how to get a specific entry ID using Kaltura's API",
    "recipe_steps": [
        {
            "inputs": [
                {
                    "default": "",
                    "type": "text",
                    "label": "Entry ID",
                    "name": "entryId"
                }
            ],
            "affects": "getMedia",
            "tip": "This is how to retrieve a single entry. Use Media Entry Filters to select which content you want to show.",
            "title": "Filtering Results"
        }
    ],
    "pages": [{
        "views": [
          "KalturaSimpleEntry"
        ],
        "actions": [{
            "service": "media",
            "action": "get",
            "view": "KalturaSimpleEntry"
        }],
        "start": {
            "view": "KalturaSimpleEntry",
            "data": {
                "action": "getMedia"
            }
        }
    }]
}
```

The recipe uses the KalturaSimpleEntry view to display the results. The view file should be placed under: code_templates/views/html/KalturaSimpleEntry.html
```
<div id="ErrorMessage" class="alert alert-danger" style="display: none">
</div>
<lucy if="result.message && result.code">
    <h1>{{result.message}}</h1>
</lucy>
<lucy if="result.id">
  <h1>Entry Info</h1>
  <p>Name: {{ result.name }}</p>
  <p>ID: {{ result.id }}</p>
  <p>Description: {{ result.description }}</p>
  <p>Plays: {{ result.plays }}</p>
</lucy>

```
After restarting the node, the new recipe should appear on the index page.

Once the recipe works correctly, one needs to generate proper tests for it by setting:
```
export WRITE_GOLDEN=true
```
and running:
```
npm test
```
And then commiting them.

## Selecting an icon for the recipe

```
"icon": "search"
```
controls which icon will be displayed. Any FontAwesome icon can be used. You can view all the available icons on the [FontAwesome website](http://fortawesome.github.io/Font-Awesome/icons/)


# How you can help (guidelines for contributors) 
Thank you for helping Kaltura grow! If you'd like to contribute please follow these steps:
* Use the repository issues tracker to report bugs or feature requests
* Read [Contributing Code to the Kaltura Platform](https://github.com/kaltura/platform-install-packages/blob/master/doc/Contributing-to-the-Kaltura-Platform.md)
* Sign the [Kaltura Contributor License Agreement](https://agentcontribs.kaltura.org/)

# Where to get help
* Join the [Kaltura Community Forums](https://forum.kaltura.org/) to ask questions or start discussions
* Read the [Code of conduct](https://forum.kaltura.org/faq) and be patient and respectful

# Get in touch
You can learn more about Kaltura and start a free trial at: http://corp.kaltura.com    
Contact us via Twitter [@Kaltura](https://twitter.com/Kaltura) or email: community@kaltura.com  
We'd love to hear from you!

# License and Copyright Information
All code in this project is released under the [AGPLv3 license](http://www.gnu.org/licenses/agpl-3.0.html) unless a different license for a particular library is specified in the applicable library path.   

Copyright © Kaltura Inc. All rights reserved.   
Authors and contributors: See [GitHub contributors list](https://github.com/kaltura/kaltura-api-recipes/graphs/contributors).  
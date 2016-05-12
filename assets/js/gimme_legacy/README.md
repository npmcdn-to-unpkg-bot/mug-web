# gimme
Easily grab Meetup API data 

* `shoppinglist` an array of objects that request data
* `useJsonp` optional (default: false), set `true` if you need cross-domain requests with JSONp
* `functionThatUsesData` do stuff with the data!

```
gimme(shoppingList, useJsonp).then(functionThatUsesData);
```

You can just clone the repo and play around, or add it to your project with npm
```
npm install meetup/gimme
```


## simple example
Gets some groups. You don't even have to care where they come from.

```
gimme.apiKey = '_your api key here_';

var shoppingList = [
  {"gimme": "groups"}
];

gimme.get(shoppingList, true).then(function(data){
  // look at all these groups!
  console.log(data);
});
```

## simple example with requirements
Gets some groups from a Los Angeles zipcode.

```
gimme.apiKey = '_your api key here_';

var shoppingList = [
  {"gimme": "groups", "data": {"zip": 90005}}
];

gimme.get(shoppingList, true).then(function(data){
  // look at all these Los Angeles groups!
  console.log(data);
});
```


## multiple requests
```
gimme.apiKey = '_your api key here_';

var shoppingList = [
  {"gimme": "group", "data": {"group_id": 9896242} },
  {"gimme": "members", "data": {"group_id": 9896242} }
];

gimme.get(shoppingList, true).then(function(data){
  // look at this group and also some members from it
  console.log(data);
});
```

## multiple requests of the same API method
Set the data container "key" name to request multiple sets of data from the same method
```
gimme.apiKey = '_your api key here_';

var shoppingList = [
  {"gimme": "groups", "key":"losangeles", "data": {"zip": 90005}},
  {"gimme": "groups", "key":"newyork", "data": {"zip": 10012}}
];

gimme.get(shoppingList, true).then(function(data){
  // look at all these Los Angeles and New York groups!
  console.log(data);
});
```

## nested requests
You can even nest data requests, like grabbing a list of upcoming events and then the comments from those events
(I'll document more thoroughly how "match" works soon, but it's basically parent ID, child ID )
```
gimme.apiKey = '_your api key here_';

var shoppingList = [
	{"gimme": "events", "data": {"group_id": 9896242, "page": 3}, "children": [ 
		{"gimme": "event_comments", "match": [ ["id", "event_id"] ] }
	  ] 
	}
];

gimme.get(shoppingList, true).then(function(data){
  // look at all these events and their comments
  console.log(data);
});
```



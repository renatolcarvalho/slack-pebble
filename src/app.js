/**
* Welcome to SlackPebble
*
* Author: Renato Luiz Carvalho
*/

//Imports
var UI = require('ui');
var ajax = require('ajax');
var Light = require('ui/light');
var indexHistory = 0;
var qtdeHistories = 0;

var token = "";

//Parses Data
var parseGroups = function(data) {
  var items = [];
  for(var i = 0; i < data.groups.length; i++) {
    // Always upper case the description string

    // Add to menu items array
    items.push({
      title: data.groups[i].name,
      subtitle: data.groups[i].topic.value
    });
  }

  // Finally return whole array
  return items;
};

//Begin
ajax({ url: 'https://slack.com/api/users.profile.get?token='+ token + '&pretty=1', type: 'json' },
     function(profileData) {

       var userName = profileData.profile.first_name + ' ' + profileData.profile.last_name;

       //Main
       var main = new UI.Card ({      
         title: 'Slack',
         subtitle: userName,
         icon: 'images/slack16black.png',
         body: profileData.profile.title,
         action: {
           select: 'images/group16white.png'
         }
       });

       main.show();
       Light.on('long');

       main.on('click', 'select', function(e) {

         //Menu Groups      
         ajax({ url: 'https://slack.com/api/groups.list?token='+ token + '&pretty=1', type: 'json' },
              function(groupsList) {

                var menuGroups = parseGroups(groupsList);
                var menu = new UI.Menu({
                  backgroundColor: 'black',
                  textColor: 'white',
                  highlightBackgroundColor: 'white',
                  highlightTextColor: 'black',
                  sections: [{
                    title: 'Groups',
                    items: menuGroups
                  }]
                });

                menu.show();
                Light.on('long');

                menu.on('select', function(e) {

                  console.log('Passei aqui');
                  console.log(groupsList.groups[e.itemIndex].id);

                  ajax(
                    {
                      url: 'https://slack.com/api/groups.history?token='+ token + '&channel=' + groupsList.groups[e.itemIndex].id + '&pretty=1',
                      type:'json'
                    },

                    function(groupHistory) {

                      indexHistory = 0;
                      qtdeHistories = groupHistory.messages.length;
                      console.log(groupHistory.messages.length);

                      // Create the Card for detailed view
                      var detailCard = new UI.Card({style: 'small'});

                      if (qtdeHistories > 0)
                      {
                        
                        ajax(
                          {
                            url: 'https://slack.com/api/users.profile.get?token='+ token + '&user=' + groupHistory.messages[indexHistory].user +'&pretty=1',
                            type:'json'
                          },

                          function(userInfo) {
                            detailCard.title(userInfo.profile.first_name);
                            detailCard.subtitle(userInfo.profile.skype);
                            detailCard.body(groupHistory.messages[indexHistory].text);
                            detailCard.show();
                            Light.on('long');
                          });
                      }
                      else
                      {
                        detailCard.title('Sorry :(');
                        detailCard.body('Not have messages');
                        detailCard.show();
                      }

                      detailCard.on('click', 'up', function(e) {
                        if (indexHistory < qtdeHistories)
                        {
                          indexHistory = indexHistory + 1;
                          
                          ajax(
                          {
                            url: 'https://slack.com/api/users.profile.get?token='+ token + '&user=' + groupHistory.messages[indexHistory].user +'&pretty=1',
                            type:'json'
                          },

                          function(userInfo) {
                            detailCard.title(userInfo.profile.first_name);
                            detailCard.subtitle(userInfo.profile.skype);
                            detailCard.body(groupHistory.messages[indexHistory].text);
                            detailCard.show();
                            Light.on('long');
                          });
                        }
                      });

                      detailCard.on('click', 'down', function(e) {
                        if (indexHistory > 0)
                        {
                          indexHistory = indexHistory - 1;
                          
                          ajax(
                          {
                            url: 'https://slack.com/api/users.profile.get?token='+ token + '&user=' + groupHistory.messages[indexHistory].user +'&pretty=1',
                            type:'json'
                          },

                          function(userInfo) {
                            detailCard.title(userInfo.profile.first_name);
                            detailCard.subtitle(userInfo.profile.skype);
                            detailCard.body(groupHistory.messages[indexHistory].text);
                            detailCard.show();
                            Light.on('long');
                          });
                        }
                      });
                    });
                });
              });
       });

       main.on('click', 'up', function(e) {});
       main.on('click', 'down', function(e) {});
     }
    );
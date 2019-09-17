const REGION = 'asia-east2';
const functions = require('firebase-functions');
const request = require('request-promise');
const feedparser = require('feedparser-promised');

const config = require('./config.json');
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer '+ config.line.channelAccessToken
};


exports.LineBot = functions.region(REGION).https.onRequest((req, res) => {
    if (req.body.events[0].message.type !== 'text') {
        return;
    }

    var lists = [];
    const url = 'http://rssfeeds.sanook.com/rss/feeds/sanook/news.lotto.xml?limit=6';
    feedparser.parse(url).then( (items) =>
    {
        items.forEach(function(item) {
            let description = item.description;
            description = description.replace(/<br \/>/g, '\n');
            let item_temp;
            item_temp = {
                "type": "bubble",
                "size": "mega",
                "hero": {
                    "type": "image",
                    "url": "https://firebasestorage.googleapis.com/v0/b/linelotto-67514.appspot.com/o/FlexLotto.jpg?alt=media&token=18c7ead9-2bfd-4281-b51a-9b5f84668421",
                    "size": "full",
                    "aspectMode": "cover",
                    "aspectRatio": "640:330"
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": item.title,
                            "weight": "bold",
                            "size": "md",
                            "wrap": true
                        },
                        {
                            "type": "separator",
                            "margin": "xxl"
                        },
                        {
                        "type": "text",
                        "text": description,
                        "color": "#666666",
                        "size": "md",
                        "flex": 6,
                        "wrap": true
                        },
                        {
                            "type": "button",
                            "style": "link",
                            "height": "sm",
                            "action": {
                                "type": "uri",
                                "label": "ดูผลรางวัลงวดนี้ทั้งหมด",
                                "uri": item.link
                            }
                        }
        
                    ],   
                    "spacing": "sm",
                    "paddingAll": "13px"
                }
            };
            lists.push(item_temp);
        });
        reply_lotto(req.body, lists);
        
    }).catch(console.error);

});

const reply_lotto = (bodyResponse, payload) => {
    
    return request({
      method: `POST`,
      uri: `${LINE_MESSAGING_API}/reply`,
      headers: LINE_HEADER,
      body: JSON.stringify({
        replyToken: bodyResponse.events[0].replyToken,
        messages: [
          {
            "type": "flex",
            "altText": "ตรวจหวย",
            "contents": {
                "type": "carousel",
                "contents": payload
            } 
          }
        ]
      })
    });
  };
  
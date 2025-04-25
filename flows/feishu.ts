export const feishuBug = (bugUrl: string) => (
        {
            "name": "虫洞BUG",
            "description": "虫洞运营",
            "datas": {
                "nodes": [
                    {
                        "width": 150,
                        "height": 39,
                        "id": "start",
                        "type": "input",
                        "data": {
                            "label": "开始",
                            "newtab": "1",
                            "newtaburl": bugUrl
                        },
                        "position": {
                            "x": 250,
                            "y": 50
                        },
                        "positionAbsolute": {
                            "x": 250,
                            "y": 50
                        },
                        "selected": true
                    },
                    {
                        "width": 150,
                        "height": 39,
                        "id": "end",
                        "type": "output",
                        "data": {
                            "label": "结束"
                        },
                        "position": {
                            "x": 250,
                            "y": 250
                        },
                        "positionAbsolute": {
                            "x": 250,
                            "y": 250
                        }
                    },
                    {
                        "width": 150,
                        "height": 36,
                        "id": "88ABDCF3",
                        "data": {
                            "label": "33D8A15D",
                            "xPath": "/html/body/div[2]/div[3]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[5]/div[@id=\"63aade9c0d2620c73c7dcfce:issue:DETAIL:detail:multi_attachment:1672142503230031816:0\"]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]",
                            "handleType": "click",
                            "inputValue": ""
                        },
                        "position": {
                            "x": 250,
                            "y": 150
                        },
                        "selected": false,
                        "positionAbsolute": {
                            "x": 250,
                            "y": 150
                        }
                    }
                ],
                "edges": [
                    {
                        "id": "99BF7C20",
                        "source": "start",
                        "target": "88ABDCF3",
                        "animated": true,
                        "type": "plusedge"
                    },
                    {
                        "id": "34347E8C",
                        "source": "88ABDCF3",
                        "target": "end",
                        "animated": true,
                        "type": "plusedge"
                    }
                ],
                "viewport": {
                    "x": 200,
                    "y": 50,
                    "zoom": 0.6
                }
            },
            "domain": "delonix.feishu.cn",
            "id": "3A7A1F33F74E7443235A58E709361CEB",
            "type": "action"
        }
    
)
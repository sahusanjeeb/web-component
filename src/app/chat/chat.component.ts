import { Component, ElementRef, ViewChild, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Message, ChatService } from '../chatbot.service';
import { DatePipe } from '@angular/common';
import { UUID } from 'angular2-uuid';
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css'],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class ChatComponent implements OnInit {
    guid: any;
    lastMessageTime: any;
    msgCount: Number = 2;
    @Input('isright') public isright: any;
    @ViewChild('scrollMe')
    private myScrollContainer!: ElementRef;
    messageDivHeight:number=0;
    removeHeight:number=500;
    messages: Message[] = [];
    messageHistory: MessageHistory[] = [];
    value: string = '';
    showChat: boolean = false;
    showLoader = false;
    chatBotStyle: any;
    messageFromStyle: any;
    aidaHeaderStyle: any;
    botMessageTime:any;
    isMaximize: boolean = true;
    constructor(public chatService: ChatService, public datepipe: DatePipe) {

    }
    ngOnInit() {
        this.getChatbodyStyles();
        this.chatService.conversation.subscribe((val) => {
            this.messages = this.messages.concat(val);
            if (this.messages[this.messages.length - 1].author == 'user' || this.messages[this.messages.length - 1].author == 'bot') {
                this.messages = this.messages.filter((value) => value.author != 'loader');
            }
        });
        let botMessage = new Message('bot', "Hi there, I am AIDA, your digital assistant, powered by Ascendion GAIN (Guided Artificial Intelligence Network).", this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
        this.messages = this.messages.concat(botMessage);
        setTimeout(() => {
            let botMessages = new Message('bot', 'You can ask me about Ascendion A.AVA, case studies, and HR polices.', this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
            this.messages = this.messages.concat(botMessages);
        }, 2000);
    }
    ngAfterViewChecked() {
        if (this.messages[this.messages.length - 1].author == 'loader' ) {
            this.scrollToBottom(true);
        }
        else{
            this.scrollToBottom(false);

        }
     }
    sendMessage() {
        let userText = this.value;
        this.value = '';
        if (userText != undefined && userText != null && userText != "") {
            let request = this.getMessageHistory(userText);
            this.chatService.getBotAnswer(request);
            this.lastMessageTime = new Date();
            this.startTrackingLoop();
        }
    }

    getMessageHistory(message: any) {
        this.guid = UUID.UUID();
        this.messageHistory = [];
        let usermsg = this.messages.filter((value: any) => value.author == 'user');
        let lastQuestion; let lastAnswer; let lastBeforeQuestion; let lastBeforeAnswer;
        if (usermsg != null && usermsg != undefined && usermsg.length > 1) {
            if (usermsg.length > 0) {
                lastQuestion = usermsg[usermsg.length - 1].content;
            }
            if (usermsg.length > 1) {
                lastBeforeQuestion = usermsg[usermsg.length - 2].content;
            }
        }
        else {
            lastQuestion = lastBeforeQuestion = "";
        }
        let botmsg = this.messages.filter((value: any) => value.author == 'bot');

        if (botmsg != null && botmsg != undefined && botmsg.length > 3) {
            if (botmsg.length > 2) {
                lastAnswer = botmsg[botmsg.length - 1].content;
            }
            if (botmsg.length > 3) {
                lastBeforeAnswer = botmsg[botmsg.length - 2].content;
            }
        }
        else {
            lastAnswer = lastBeforeAnswer = "";
        }

        let messages = new MessageHistory(message, this.guid, lastBeforeQuestion, lastBeforeAnswer, lastQuestion, lastAnswer);
        this.messageHistory.push(messages);
        return this.messageHistory[0];
    }

    startTrackingLoop() {
        setTimeout(() => {
            let currentTime = new Date();
            let secondDiff = (currentTime.getTime() - this.lastMessageTime.getTime()) / 1000;
            if (secondDiff > 300.0) {
                this.messages = [];
                this.showChat = false;
                let botMessage = new Message('bot', 'Hi there, I am AIDA, your digital assistant, powered by Ascendion GAIN (Guided Artificial Intelligence Network).', this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
                this.messages = this.messages.concat(botMessage);
                setTimeout(() => {
                    let botMessages = new Message('bot', 'You can ask me about Ascendion A.AVA, case studies, and HR polices.', this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
                    this.messages = this.messages.concat(botMessages);
                }, 2000);

            }
        }, 300000)
    }

    scrollToBottom(isScrollToBottom:boolean): void {
        try {
            if(isScrollToBottom){
                this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
                this.messageDivHeight= this.myScrollContainer.nativeElement.scrollHeight;
            }
            else{
                this.myScrollContainer.nativeElement.scrollTop = this.messageDivHeight-100;
            }
        } catch (err) { }
    }

    getChatIconStyles() {
        let style = `position: ${'fixed'};
        bottom: ${0};
        right: ${0};
        cursor: ${'pointer'};
        margin-bottom: ${'1%'};
        margin-right:${'2%'};
        margin-left: ${'5%'};
        z-index: ${'9999'};`;

        if (this.isright != undefined && this.isright == true) {
            style = `position: ${'fixed'};
            bottom: ${0};
            right: ${0};
            cursor: ${'pointer'};
            margin-bottom: ${'1%'};
            margin-right:${'2%'};
            margin-left: ${'5%'};
            z-index: ${'9999'};`;
        }
        return style;

    }

    getMessageFromStyle(className: any) {
        if (className == "bot") {
            if (this.isMaximize) {
                this.messageFromStyle = `
            background-color: rgba(232,232,232, 1);
            color: #000000;
            width: 75%;
            border-radius: 0px 10px 10px 10px;
            margin-left: 8%;
            margin-top: 3%;
            border: 1px solid rgba(223,223,223, 1);
            overflow: hidden;`;
            }
            else {
                this.messageFromStyle = `
            background-color: rgba(232,232,232, 1);
            color: #000000;
            width: 75%;
            border-radius: 0px 10px 10px 10px;
            margin-left: 15%;
            margin-top: 3%;
            border: 1px solid rgba(223,223,223, 1);
            overflow: hidden;`;
            }
        }
        if (className == "user") {
            this.messageFromStyle = ` color: white;
    width: 75%;
    margin-top: 3%;
    background-color: #000000;
    border-radius: 10px 10px 10px 10px;
    float: right;
    margin-right: 3%;
    overflow: hidden;`
        }
        return this.messageFromStyle;
    }

    getBotMessageTime(className: any) {
        if (className == "bot") {
            if(this.isMaximize){
                this.botMessageTime = `
                color: #949494;
                font-size: 12px;
                margin-top: 1%;
                margin-left: 8%;`
            }
            else{
                this.botMessageTime = `
                color: #949494;
                font-size: 12px;
                margin-top: 1%;
                margin-left: 15%;`
            }

        }

        if (className == "user") {
            if(!this.isMaximize){
                this.botMessageTime = `
                color: #949494;
                float: right;
                font-size: 12px;
                margin-top: 1%;
                margin-right: 3%;`
            }
            else{
                this.botMessageTime = `
                color: #949494;
                float: right;
                font-size: 12px;
                margin-top: 1%;
                margin-right: 64%;`
            }

        }
        return this.botMessageTime;
    }

    getChatbodyStyles() {
        this.chatBotStyle = `
            height: ${'65%'};
            width: ${'30%'};
            right: ${0};
            border-radius: ${'10px'};
            margin: ${'2% 2% 6.5% 5%'};
            position: ${'fixed'};
            bottom: ${'0'};
            box-shadow: ${'0px 13px 25px rgba(0, 0, 0, 0.107955)'};
            opacity: ${'1'};
            background-color: ${'rgba(255, 255, 255, 1)'};
            z-index: ${'9999'};
        `;
        if (this.isMaximize) {
            // if (this.isright != undefined && this.isright == true) {
                this.chatBotStyle = `height: ${'65%'};
                    width: ${'30%'};
                    border-radius: ${'10px'};
                    margin: ${'2% 2% 6.5% 5%'};
                    position: ${'fixed'};
                    bottom: ${'0'};
                    box-shadow: ${'0px 13px 25px rgba(0, 0, 0, 0.107955)'};
                    opacity: ${'1'};
                    background-color: ${'rgba(255, 255, 255, 1)'};
                    right: ${'0'};
                    z-index: ${'9999'};`;
            // }
        }
        else {
            this.chatBotStyle = `height: ${'85%'};
            width: ${'60%'};
            border-radius: ${'10px'};
            margin: ${'2% 2% 6.5% 5%'};
            position: ${'fixed'};
            bottom: ${'0'};
            box-shadow: ${'0px 13px 25px rgba(0, 0, 0, 0.107955)'};
            opacity: ${'1'};
            background-color: ${'rgba(255, 255, 255, 1)'};
            right: ${'0'};
            z-index: ${'9999'};`;
        }
        this.isMaximize = !this.isMaximize;
        this.getAidaHeaderStyle();
        return this.chatBotStyle;
    }


    getAidaHeaderStyle() {
        if (!this.isMaximize) {
            this.aidaHeaderStyle = `    color: rgba(255, 255, 255, 1);
            font-family: sans-serif;
            font-weight: 550;
            font-style: normal;
            font-size: 18px;`
        }
        else {
            this.aidaHeaderStyle = `    color: rgba(255, 255, 255, 1);
            font-family: sans-serif;
            font-weight: 550;
            font-style: normal;
            font-size: 25px;`
        }
        return this.aidaHeaderStyle;
    }

}
export class MessageHistory {
    constructor(public message: any, public guid: any, public q1: any, public a1: any, public q2: any, public a2: any) { }
}

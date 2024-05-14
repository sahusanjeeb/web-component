import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Subject, timeout } from 'rxjs';
import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';


export class Message {
    constructor(
        public author: string,
        public content: string,
        public messageTime: any,
    ) { }
}
export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');
@Injectable()
export class ChatService implements HttpInterceptor {
    busy: any;
    // guid:any;
    constructor(private http: HttpClient, public datepipe: DatePipe, @Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number) {
    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const timeoutValue = req.headers.get('timeout') || this.defaultTimeout;
        const timeoutValueNumeric = Number(timeoutValue);

        return next.handle(req).pipe(timeout(timeoutValueNumeric));
    }
    conversation = new Subject<Message[]>();
    getBotAnswer(request: any): any {
        const userMessage = new Message('user', request.message, this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
        this.conversation.next([userMessage]);
        const loader = new Message('loader', '', this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
        this.conversation.next([loader]);

        setTimeout(() => {
            return this.busy = this.http.post("https://aidabot.ascendion.com/chat", request, { headers: new HttpHeaders({ timeout: `${90000}` }) }).subscribe(

                (res: any) => {
                    if (res.message == 'Error') {
                        const botMessage = new Message('bot', 'Apologies, An error occurred while connecting to OpenAI servers. Please retry after sometime.', this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
                        this.conversation.next([botMessage]);
                        return this.conversation;
                    }
                    else {
                        if (request.guid == res.guid) {
                            res.response = this.convertLinkstoHyperLink(res.response);
                            const botMessage = new Message('bot', res.response, this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
                            this.conversation.next([botMessage]);
                        }
                        return this.conversation;
                    }
                },
                err => {
                    if (err != null && err != undefined && err.message != null && err.message != undefined && err.message == "Timeout has occurred") {
                        const botMessage = new Message('bot', "There is delay in processing your request by OpenAI. Please retry after some time. You may revise your question to provide specific context to ChatGPT model", this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
                        this.conversation.next([botMessage]);
                    }
                    else if (err != null && err != undefined && err.message != null && err.message != undefined && err.message != "Timeout has occurred") {
                        const botMessage = new Message('bot', err.message, this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
                        this.conversation.next([botMessage]);
                    }
                    else if (err != null && err != undefined && err.statusText != null && err.statusText != undefined) {
                        const botMessage = new Message('bot', err.statusText, this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
                        this.conversation.next([botMessage]);
                    }
                    else {
                        const botMessage = new Message('bot', 'Apologies, An error occurred while connecting to OpenAI servers. Please retry after sometime.', this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss'));
                        this.conversation.next([botMessage]);
                    }

                },
                () => { });
        }, 1000)
    }


    convertLinkstoHyperLink(message: any) {
        const pattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
        let regexForSpecialCharacter = /[\[\]()]/g;
        let matdhedLinks = message.match(pattern);
        if (matdhedLinks != null && matdhedLinks != undefined) {
            message = message.replace(regexForSpecialCharacter, ' ');
            if (message.endsWith('.') || message.endsWith(',')) {
                message = message.slice(0, message.length - 1)
            }
        }
        let actualMessage = message;
        actualMessage = actualMessage.replace(pattern, function (url: any) {
            var displayedUrl = url;
            if (!url.startsWith("http")) {
                displayedUrl = "http://" + url;
            }
            return '<a href="' + displayedUrl + '" target="_blank">' + url + '</a>';
        });

        return actualMessage;
    }

    getBotMessage(question: string, guid: string) {
        return this.http.get("https://aidabot.ascendion.com/chat?message=" + question + "&&guid=" + guid, { headers: new HttpHeaders({ timeout: `${10}` }) }).subscribe(null, err => {
        });
    }

}
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { ChatComponent } from './chat/chat.component';
import { ChatService, DEFAULT_TIMEOUT } from './chatbot.service';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [ChatComponent],
  imports: [
    BrowserModule,
    FormsModule, 
    HttpClientModule    
  ],
  bootstrap: [ChatComponent],
  providers:[ChatService,DatePipe,
    [{ provide: HTTP_INTERCEPTORS, useClass: ChatService, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: 20000 }]]
})
export class AppModule {
  constructor(private injector:Injector){

  }
  ngDoBootstrap(){
    const table=createCustomElement(ChatComponent,{injector:this.injector});
    customElements.define('app-chat',table);
  }
 }

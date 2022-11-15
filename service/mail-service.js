import nodemailer from 'nodemailer'
import config from "config";
class MailService{
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.get('SMTP_HOST'),// host почтового сервиса
            port: config.get('SMTP_PORT'),// port почтового сервиса
            secure:true,
            auth: {
                user: "abdulaev_rustem@mail.ru",
                pass: "bUaLdvJdKZmc7UbJ5YWw"
            } // аворизационная инфа об аккаунте откуда будут отправляться письма
        })
    }

    async sendActivationMail(to,activationLink){
          await this.transporter.sendMail({
              from: config.get('SMTP_USER'),
              to,
              subject: `Активация аккаунта на сайте ${config.get('URL')}`,
              text:'',
              html:`<div>
                        <h1>Для активации аккаунта перейдите по ссылке</h1>
                        <a href="${activationLink}">${activationLink}</a>
                    </div>`

          })

    }
}

export default new MailService ()
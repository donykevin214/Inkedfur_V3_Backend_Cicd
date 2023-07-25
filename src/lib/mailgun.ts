import Mailgun from 'mailgun-js';
import config from '~/config';

const mg = Mailgun({
    apiKey: config.mailGun.apiKey,
    domain: config.mailGun.domain,
});

const mailGun = async (to: string, subject: string, html: string) =>
  mg.messages().send({
    from: config.mailGun.from,
    to,
    subject,
    html,
});

export default mailGun;
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ConsultLead {
  id: string;
  target: string;
  userName: string;
  gender: string;
  birthDate: string;
  userPhone: string;
  createdAt: string;
}

const leads: ConsultLead[] = [];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API route for consultation submission
  app.post('/api/consult', async (req, res) => {
    try {
      const { target, userName, gender, birthDate, userPhone } = req.body;

      if (!userName || !birthDate || !userPhone) {
        return res.status(400).json({ success: false, error: '필수 입력 항목이 누락되었습니다.' });
      }

      const newLead: ConsultLead = {
        id: Math.random().toString(36).substring(2, 9),
        target: target || '본인',
        userName,
        gender: gender || '남성',
        birthDate,
        userPhone,
        createdAt: new Date().toISOString()
      };

      leads.unshift(newLead);

      // Optional Telegram notification if env vars are present
      const botToken = process.env.TELEGRAM_BOT_TOKEN || "9231034424:AAER1jxU3MY31kPsRnSQ6dwHmbWzdWz7Sfg";
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (botToken && chatId && !chatId.includes('여기에')) {
        try {
          const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
          const text = [
            `🚨 <b>[보험플러스] 신규 간병보험 DB 접수!</b>`,
            ``,
            `• <b>상담대상:</b> ${newLead.target}`,
            `• <b>성함:</b> ${newLead.userName}`,
            `• <b>성별/생년월일:</b> ${newLead.gender} / ${newLead.birthDate}`,
            `• <b>연락처:</b> <code>${newLead.userPhone}</code>`,
            `• <b>접수시간:</b> ${now}`,
            ``,
            `⚡ 골든타임(10분 이내) 내 빠르게 상담 연결하세요!`
          ].join('\n');

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: 'HTML'
            })
          });
        } catch (tgErr) {
          console.error('Telegram notification error:', tgErr);
        }
      }

      // Forward lead to Formspree
      try {
        await fetch('https://formspree.io/f/xrpqjlbl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            target: newLead.target,
            name: newLead.userName,
            gender: newLead.gender,
            birthDate: newLead.birthDate,
            phone: newLead.userPhone,
            _to: 'sonjg1230@gmail.com',
            message: `[보험플러스] 신규 간병보험 상담신청 - 대상: ${newLead.target}, 성함: ${newLead.userName}, 성별: ${newLead.gender}, 생년월일: ${newLead.birthDate}, 연락처: ${newLead.userPhone}`
          })
        });
      } catch (fsErr) {
        console.error('Formspree forward error:', fsErr);
      }

      return res.json({ success: true, leadId: newLead.id });
    } catch (err: any) {
      console.error('Consult submit error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // API route to list consultation leads (for admin view)
  app.get('/api/leads', (req, res) => {
    return res.json({ success: true, leads });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

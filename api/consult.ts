export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { target, userName, gender, birthDate, userPhone } = body;

    if (!userName || !birthDate || !userPhone) {
      return res.status(400).json({ success: false, error: '필수 입력 항목이 누락되었습니다.' });
    }

    const newLead = {
      id: Math.random().toString(36).substring(2, 9),
      target: target || '본인',
      userName,
      gender: gender || '남성',
      birthDate,
      userPhone,
      createdAt: new Date().toISOString()
    };

    // Optional Telegram notification if env vars are configured
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '9231034424:AAER1jxU3MY31kPsRnSQ6dwHmbWzdWz7Sfg';
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

    return res.status(200).json({ success: true, leadId: newLead.id });
  } catch (err: any) {
    console.error('Consult submit error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Calculator,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  FileX,
  Lock,
  RefreshCw,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';

const WonIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 6l3.5 12L12 7l4.5 11L20 6" />
    <path d="M3 11.5h18" />
    <path d="M4 15h16" />
  </svg>
);

interface ConsultLead {
  id?: string;
  target: string;
  userName: string;
  gender: string;
  birthDate: string;
  userPhone: string;
  createdAt?: string;
}

export default function App() {
  const [target, setTarget] = useState('본인');
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState('남성');
  const [birthDate, setBirthDate] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [privacyAgree, setPrivacyAgree] = useState(true);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<ConsultLead | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [leads, setLeads] = useState<ConsultLead[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const reviews = [
    {
      text: "어머니가 갑자기 뇌경색으로 쓰러지셨을 때 하루 15만 원씩 나오는 간병비 때문에 눈앞이 캄캄했습니다. 다행히 1년 전 보험플러스에서 추천받아 가입해 둔 간병보험 덕분에 전문 간병인을 모시고 저도 직장을 지킬 수 있었습니다.",
      author: "경기도 수원시 · 50대 김*현 고객님"
    },
    {
      text: "혈압약을 먹고 있어서 가입이 안 될 줄 알았는데, 여러 보험사를 한 번에 비교해 주셔서 간편심사로 부담 없는 금액에 준비했습니다. 자식들에게 짐이 되지 않을 생각에 마음이 한결 놓입니다.",
      author: "서울시 송파구 · 60대 박*숙 고객님"
    },
    {
      text: "부모님 두 분 모두 간병보험을 들어드려야 하나 고민이 많았는데, 20년 차 전문가 분이 친절하게 비교 견적을 뽑아주셔서 예산에 딱 맞는 체증형 플랜으로 가입했습니다. 든든합니다!",
      author: "부산시 해운대구 · 40대 이*진 고객님"
    },
    {
      text: "주변 지인이 갑자기 병원에 입원했을 때 간병비로 고생하는 걸 보고 바로 가입했습니다. 실비로는 간병인이 보장 안 된다는 걸 일찍 알게 되어서 정말 다행이에요.",
      author: "인천시 연수구 · 50대 최*호 고객님"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  // Auto-format phone number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 3 && val.length <= 7) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 7) {
      val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
    }
    setUserPhone(val);
  };

  // Auto-format birthdate (numbers only)
  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 8) {
      setBirthDate(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userName.trim() || userName.trim().length < 2) {
      setErrorMsg('성함을 정확히 입력해 주세요.');
      return;
    }

    if (birthDate.length !== 8) {
      setErrorMsg('생년월일 8자리를 정확히 입력해 주세요. (예: 19720815)');
      return;
    }

    if (userPhone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('올바른 휴대폰 번호를 입력해 주세요.');
      return;
    }

    if (!privacyAgree) {
      setErrorMsg('무료 상담을 위해 개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: ConsultLead = {
        target,
        userName: userName.trim(),
        gender,
        birthDate,
        userPhone
      };

      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const rawText = await res.text();
      let data: { success?: boolean; error?: string } | null = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        // If backend endpoint is unavailable (e.g. static deploy), forward directly to Formspree
        if (res.status === 404 || !data) {
          const fsRes = await fetch('https://formspree.io/f/xrpqjlbl', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              target: payload.target,
              name: payload.userName,
              gender: payload.gender,
              birthDate: payload.birthDate,
              phone: payload.userPhone,
              _to: 'sonjg1230@gmail.com',
              message: `[보험플러스] 신규 간병보험 상담신청 - 대상: ${payload.target}, 성함: ${payload.userName}, 성별: ${payload.gender}, 생년월일: ${payload.birthDate}, 연락처: ${payload.userPhone}`
            })
          });
          if (!fsRes.ok) {
            throw new Error('접수 중 오류가 발생했습니다.');
          }
        } else {
          throw new Error(data.error || '접수 중 오류가 발생했습니다.');
        }
      }

      setSuccessData(payload);
      // Reset form
      setUserName('');
      setBirthDate('');
      setUserPhone('');
    } catch (err: any) {
      setErrorMsg(err.message || '네트워크 연결을 확인한 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) return;
      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : null;
      if (data?.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchLeads();
    }
  }, [isAdminAuthenticated]);

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-['Noto_Sans_KR',sans-serif]">
      {/* 상단 고정 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* 로고 */}
          <a href="#" className="flex items-center shrink-0" aria-label="보험플러스 홈">
            <svg className="h-10 sm:h-12 w-auto" viewBox="0 0 360 105" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="heartBlue" x1="15" y1="20" x2="55" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00B4FF"/>
                  <stop offset="100%" stopColor="#0044CC"/>
                </linearGradient>
                <linearGradient id="heartGreen" x1="55" y1="15" x2="95" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#A8E61D"/>
                  <stop offset="100%" stopColor="#1E8E3E"/>
                </linearGradient>
                <linearGradient id="goldPlus" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFE066"/>
                  <stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
                <linearGradient id="swooshGrad" x1="100" y1="80" x2="340" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2"/>
                  <stop offset="50%" stopColor="#0284C7"/>
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              <path d="M52 86C52 86 16 64 16 37C16 23 27 14 39 14C46 14 51 18 54 23C50 28 48 35 51 44C54 53 60 66 52 86Z" fill="url(#heartBlue)"/>
              <path d="M52 86C52 86 92 62 92 35C92 21 81 12 69 12C61 12 56 17 54 23C59 29 61 38 56 50C51 62 43 76 52 86Z" fill="url(#heartGreen)"/>
              <path d="M48 88C64 78 82 62 96 46C83 66 66 81 48 88Z" fill="#4ADE80"/>
              <circle cx="43" cy="36" r="5.5" fill="#0284C7"/>
              <path d="M33 56C33 48 37 44 43 44C49 44 53 48 53 56" fill="#0284C7"/>
              <circle cx="64" cy="39" r="5" fill="#0369A1"/>
              <path d="M55 58C55 51 59 47 64 47C69 47 73 51 73 58" fill="#0369A1"/>
              <circle cx="53.5" cy="48" r="4.2" fill="#0EA5E9"/>
              <path d="M46 64C46 58 49 55 53.5 55C58 55 61 58 61 64" fill="#0EA5E9"/>
              <path d="M97 8L99.5 16.5L108 19L99.5 21.5L97 30L94.5 21.5L86 19L94.5 16.5L97 8Z" fill="#F59E0B"/>
              <g transform="skewX(-8)">
                <text x="114" y="66" fontFamily="sans-serif" fontWeight="900" fontSize="40" letterSpacing="-1.5" fill="#0F172A">보험</text>
                <text x="190" y="66" fontFamily="sans-serif" fontWeight="900" fontSize="40" letterSpacing="-1.5" fill="#D97706">플러스</text>
              </g>
              <path d="M322 22H331V31H340V40H331V49H322V40H313V31H322V22Z" fill="url(#goldPlus)"/>
              <path d="M105 78C165 70 265 70 335 78C265 74 165 74 105 78Z" fill="url(#swooshGrad)"/>
              <text x="220" y="94" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="11.5" letterSpacing="1.5" fill="#475569">— 당신의 행복을 지키는 보험 —</text>
            </svg>
          </a>

          {/* 우측 CTA 버튼 */}
          <div className="flex items-center gap-2">
            <a href="#consult-form" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-md shadow-blue-600/20 transition whitespace-nowrap shrink-0">
              <Calculator className="w-4 h-4" />
              <span>내 보험료 조회</span>
            </a>
          </div>
        </div>
      </header>

      {/* 1. 히어로 섹션 */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1d4ed8] text-white pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-300 mb-6 whitespace-nowrap">
            <Award className="w-4 h-4" />
            <span>20년 차 베테랑 설계사 1:1 분석 제공</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight sm:leading-[1.2] tracking-tight mb-6">
            아픈 것보다 무서운 간병비 폭탄,<br />
            <span className="text-amber-400 underline decoration-amber-400/40 underline-offset-8">하루 15만 원</span> 감당하실 수 있나요?
          </h1>

          <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            실손보험에서도 <strong className="text-white font-bold">사적 간병인 비용은 1원도 보장되지 않습니다.</strong><br className="hidden sm:inline" />
            가족의 생계와 평온한 일상을 지키는 가장 현실적인 간병비 플랜을 지금 확인하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#consult-form" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg sm:text-xl px-8 py-4 rounded-2xl shadow-xl transition animate-pulse">
              <span>내 간병비 보험료 무료 조회하기</span>
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs sm:text-sm text-blue-200/80 mt-4">
            ※ 상담 신청 시 어떠한 비용도 발생하지 않으며, 불필요한 가입 권유를 하지 않습니다.
          </p>
        </div>
      </section>

      {/* 2. 문제 제기 섹션 */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-blue-600 font-bold text-sm tracking-wider uppercase">REALITY CHECK</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 mb-4">
            "긴 병에 효자 없다"는 말,<br className="sm:hidden" /> 이제는 냉정한 현실입니다
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            20년간 수많은 보상 현장을 지켜보며 가장 안타까웠던 순간은,<br className="hidden sm:inline" />
            치료비가 아니라 <strong>매달 현금으로 나가는 간병비 때문에 치료를 포기하는 경우</strong>였습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5">
              <WonIcon className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-red-600 mb-1">24시간 간병 기준</div>
            <h3 className="text-xl font-black text-slate-900 mb-3">하루 평균 12~15만 원</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              한 달만 입원해도 <strong className="text-slate-900">약 400만~450만 원</strong>의 순수 간병비가 발생합니다. 웬만한 직장인 월급이 그대로 사라지는 금액입니다.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <FileX className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-amber-600 mb-1">실손보험의 사각지대</div>
            <h3 className="text-xl font-black text-slate-900 mb-3">실비보험 보장 불가</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              많은 분들이 실손보험만 믿고 계시지만, 개인이 고용하는 <strong className="text-slate-900">간병인 사용 비용은 비급여 항목으로 실비에서 전혀 보상되지 않습니다.</strong>
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-blue-600 mb-1">가족 전체의 위기</div>
            <h3 className="text-xl font-black text-slate-900 mb-3">휴직·퇴사 후 직접 간병</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              간병비를 아끼려 자녀나 배우자가 직장을 그만두고 병실을 지키다 <strong className="text-slate-900">소득 단절과 간병 우울증</strong>까지 겪는 사례가 속출하고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 핵심 비교 섹션 (없는 사람 vs 있는 사람) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-100 border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold text-sm tracking-wider uppercase">BEFORE & AFTER</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 mb-4">
              간병비 보험, <span className="text-blue-600">준비한 사람</span>과 <span className="text-red-600">없는 사람</span>의 결정적 차이
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              갑작스러운 입원 순간, 가족의 표정과 통장 잔고가 완전히 달라집니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 없는 경우 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-100 shadow-sm">
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
                <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-lg">✕</span>
                <div>
                  <div className="text-xs font-bold text-red-500">대비가 안 된 경우</div>
                  <h3 className="text-xl font-black text-slate-900">간병비 보험이 없는 사람</h3>
                </div>
              </div>

              <ul className="space-y-5">
                <li className="flex items-start gap-3.5">
                  <span className="text-red-500 mt-0.5 shrink-0"><CircleX className="w-5 h-5" /></span>
                  <div>
                    <div className="font-bold text-slate-900 text-base">매일 15만 원씩 생돈 지출</div>
                    <p className="text-sm text-slate-600 mt-0.5">한 달 450만 원, 6개월이면 2,700만 원의 현금이 통장에서 그대로 빠져나갑니다.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="text-red-500 mt-0.5 shrink-0"><CircleX className="w-5 h-5" /></span>
                  <div>
                    <div className="font-bold text-slate-900 text-base">가족의 직장 휴직 및 교대 간병</div>
                    <p className="text-sm text-slate-600 mt-0.5">비용 부담 때문에 가족이 연차를 쓰거나 퇴사해 24시간 쪽잠을 자며 병간호에 매달립니다.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="text-red-500 mt-0.5 shrink-0"><CircleX className="w-5 h-5" /></span>
                  <div>
                    <div className="font-bold text-slate-900 text-base">간병비 걱정으로 조기 퇴원 고민</div>
                    <p className="text-sm text-slate-600 mt-0.5">충분한 재활과 치료가 필요함에도 매일 불어나는 비용 때문에 퇴원을 서두르게 됩니다.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="text-red-500 mt-0.5 shrink-0"><CircleX className="w-5 h-5" /></span>
                  <div>
                    <div className="font-bold text-slate-900 text-base">가족 간 경제적 분담 갈등</div>
                    <p className="text-sm text-slate-600 mt-0.5">형제·자매 간 간병비 부담과 간병 시간 문제로 감정이 상하고 불화가 생깁니다.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 있는 경우 */}
            <div className="bg-blue-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-blue-500 shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                추천 플랜
              </div>
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-white/15">
                <span className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-lg">✓</span>
                <div>
                  <div className="text-xs font-bold text-amber-300">보험플러스 맞춤 설계</div>
                  <h3 className="text-xl font-black text-white">간병비 보험이 있는 사람</h3>
                </div>
              </div>

              <ul className="space-y-5">
                <li className="flex items-start gap-3.5">
                  <span className="text-amber-400 mt-0.5 shrink-0"><CircleCheck className="w-5 h-5" /></span>
                  <div>
                    <div className="font-bold text-white text-base">매일 최대 15~20만 원 간병비 지급</div>
                    <p className="text-sm text-blue-100 mt-0.5">가입 한도 내에서 하루 단위로 정액 보장되어 모아둔 노후 자금을 안전하게 지킵니다.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="text-amber-400 mt-0.5 shrink-0"><CircleCheck className="w-5 h-5" /></span>
                  <div>
                    <div className="font-bold text-white text-base">전문 간병인 고용 & 가족 본업 유지</div>
                    <p className="text-sm text-blue-100 mt-0.5">검증된 전문 간병인이나 간호·간병통합서비스를 비용 부담 없이 바로 이용할 수 있습니다.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="text-amber-400 mt-0.5 shrink-0"><CircleCheck className="w-5 h-5" /></span>
                  <div>
                    <div className="font-bold text-white text-base">완치될 때까지 충분한 치료 집중</div>
                    <p className="text-sm text-blue-100 mt-0.5">돈 걱정 없이 환자는 회복에만 전념하고, 가족은 퇴근 후 따뜻한 위로만 건넬 수 있습니다.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="text-amber-400 mt-0.5 shrink-0"><CircleCheck className="w-5 h-5" /></span>
                  <div>
                    <div className="font-bold text-white text-base">물가 상승까지 대비하는 체증형 설계</div>
                    <p className="text-sm text-blue-100 mt-0.5">시간이 지날수록 오르는 간병 인건비에 맞춰 보장 금액이 커지는 플랜까지 선택 가능합니다.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 전문가 핵심 체크포인트 */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-amber-400 font-bold text-sm tracking-wider uppercase">EXPERT'S INSIGHT</span>
            <h2 className="text-2xl sm:text-4xl font-black mt-2 mb-4">
              20년 차 설계사가 알려주는<br className="sm:hidden" /> 간병보험 가입 <span className="text-amber-400">3대 핵심 기준</span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
              무작정 비싼 상품이 좋은 것이 아닙니다. 아래 3가지를 비교해야 후회하지 않습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-7 flex flex-col">
              <div className="inline-block bg-blue-500/20 text-blue-300 font-black text-xs px-3 py-1 rounded-full w-fit mb-4">
                POINT 01
              </div>
              <h3 className="text-xl font-black text-white min-h-[3.5rem] flex items-center mb-3">
                체증형 vs 정액형,<br />내 연령대에 맞는 선택
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed flex-grow">
                4050 세대는 20~30년 뒤 물가 상승을 대비해 <strong className="text-amber-300">보장액이 늘어나는 체증형</strong>이 유리하며, 6070 부모님 세대는 <strong className="text-amber-300">초기 보장이 큰 정액형</strong>이 합리적입니다.
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-7 flex flex-col">
              <div className="inline-block bg-amber-500/20 text-amber-300 font-black text-xs px-3 py-1 rounded-full w-fit mb-4">
                POINT 02
              </div>
              <h3 className="text-xl font-black text-white min-h-[3.5rem] flex items-center mb-3">
                간호·간병통합서비스 +<br />사적 간병인 동시 보장
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed flex-grow">
                병원 상황에 따라 통합병동을 이용할 수도, 개인 간병인을 써야 할 수도 있습니다. <strong className="text-amber-300">두 가지 경우 모두 빈틈없이 보장</strong>되는지 반드시 확인해야 합니다.
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-7 flex flex-col">
              <div className="inline-block bg-emerald-500/20 text-emerald-300 font-black text-xs px-3 py-1 rounded-full w-fit mb-4">
                POINT 03
              </div>
              <h3 className="text-xl font-black text-white min-h-[3.5rem] flex items-center mb-3">
                고혈압·당뇨·고령자도<br />가입 가능한 간편심사 비교
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed flex-grow">
                보험사마다 인수 기준과 보험료 차이가 큽니다. 전 보험사 비교를 통해 <strong className="text-amber-300">병력이 있어도 거절 없이 가장 저렴한 플랜</strong>을 찾아드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 실제 고객 후기 슬라이더 */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-blue-600 font-bold text-sm tracking-wider uppercase">REAL REVIEWS</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            보험플러스를 통해 미리 준비하신 고객님들의 이야기
          </h2>
        </div>

        <div className="relative mx-auto max-w-2xl px-6 sm:px-12">
          {/* 슬라이더 카드 */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl transition-all duration-500 min-h-[220px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <p className="text-slate-800 text-base sm:text-lg leading-relaxed mb-6 font-medium">
                "{reviews[activeReviewIndex].text}"
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-sm font-bold text-slate-600">{reviews[activeReviewIndex].author}</div>
              <div className="text-xs text-slate-400 font-semibold">
                {activeReviewIndex + 1} / {reviews.length}
              </div>
            </div>
          </div>

          {/* 좌우 이동 버튼 */}
          <button
            type="button"
            onClick={() => setActiveReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)}
            className="absolute left-0 sm:left-[-15px] top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer z-10"
            aria-label="이전 후기"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveReviewIndex((prev) => (prev + 1) % reviews.length)}
            className="absolute right-0 sm:right-[-15px] top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer z-10"
            aria-label="다음 후기"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 인디케이터 점 */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveReviewIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeReviewIndex === idx ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`후기 ${idx + 1}로 이동`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 (FAQ) 섹션 */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-100 border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold text-sm tracking-wider uppercase">FAQ</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-slate-600 text-base">
              간병인 보험 가입 전 가장 많이 궁금해하시는 내용들을 모았습니다.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "가입 연령 제한이 어떻게 되나요?",
                a: "만 15세부터 최대 90세까지 가입하실 수 있습니다. 고령자 및 유병력자 분들도 간편심사 플랜을 통해 거절 없이 가입이 가능합니다."
              },
              {
                q: "보험료는 어떤 요인에 따라 결정되나요?",
                a: "가입 연령, 성별, 보장 금액(일당 15만 원 vs 20만 원), 납입 기간 및 보장 기간(20년납 90세 만기 등), 그리고 물가 상승을 대비하는 체증형 선택 여부에 따라 결정됩니다."
              },
              {
                q: "면책 기간이나 감액 기간이 있나요?",
                a: "상품과 담보에 따라 가입 후 최초 90일간 면책 기간이 적용될 수 있습니다. 단, 상해 입원이나 일부 간병인 사용일당 담보는 즉시 또는 짧은 대기 기간 후 보장되니 자세한 사항은 1:1 맞춤 안내를 받아보세요."
              },
              {
                q: "고혈압이나 당뇨 등 지병이 있어도 가입할 수 있나요?",
                a: "네, 가능합니다. 최근 3개월 이내 입원·수술 소견이 없으셨다면 3.5.5 또는 3.2.5 간편심사 플랜을 통해 약 복용 중이셔도 부담 없이 가입하실 수 있습니다."
              },
              {
                q: "실손보험이 있는데 간병보험이 꼭 필요한가요?",
                a: "실손보험은 병원 치료비(급여·비급여)를 보장하지만, 환자가 개인이 고용하는 '사적 간병인 사용 비용'은 실손에서 보장되지 않는 대표적인 사각지대입니다. 따라서 간병보험을 통해 매일 정액으로 보장받아야 노후 자금을 안전하게 지킬 수 있습니다."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left font-bold text-slate-900 text-base sm:text-lg flex items-center justify-between gap-4 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 font-black">Q</span>
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      <div className="flex gap-3">
                        <span className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 font-black mt-0.5">A</span>
                        <div className="flex-1">{faq.a}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. DB 수집 폼 섹션 */}
      <section id="consult-form" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-slate-100 border-t border-blue-100">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
            <div className="text-center mb-8">
              <span className="inline-block bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 rounded-full mb-3">
                100% 무료 비교 견적
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                우리 가족 간병비 보험료,<br />지금 1분 만에 확인하세요
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                전 보험사 비교 견적표를 무료로 안내해 드립니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* 상담 대상 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">상담 대상</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['본인', '부모님', '배우자/가족'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTarget(item)}
                      className={`py-2.5 rounded-xl border text-sm font-bold transition ${
                        target === item
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'border-slate-300 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 이름 & 성별 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="userName" className="block text-sm font-bold text-slate-700 mb-1.5">
                    성함 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-base transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">성별</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['남성', '여성'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-3 rounded-xl border text-sm font-bold transition ${
                          gender === g
                            ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                            : 'border-slate-300 text-slate-600 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {g === '남성' ? '남' : '여'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 생년월일 */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-bold text-slate-700 mb-1.5">
                  생년월일 (8자리) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="birthDate"
                  maxLength={8}
                  value={birthDate}
                  onChange={handleBirthChange}
                  placeholder="예: 19720815"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-base transition"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label htmlFor="userPhone" className="block text-sm font-bold text-slate-700 mb-1.5">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="userPhone"
                  maxLength={13}
                  value={userPhone}
                  onChange={handlePhoneChange}
                  placeholder="숫자만 입력 (예: 01012345678)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-base transition"
                />
              </div>

              {/* 개인정보 동의 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={privacyAgree}
                      onChange={(e) => setPrivacyAgree(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-800">[필수] 개인정보 수집 및 이용 동의</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyDetail(!showPrivacyDetail)}
                    className="text-xs font-bold text-slate-500 underline hover:text-slate-800 shrink-0"
                  >
                    {showPrivacyDetail ? '접기' : '내용보기'}
                  </button>
                </div>
                {showPrivacyDetail && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 leading-relaxed space-y-1">
                    <p>• 수집항목: 성함, 생년월일, 성별, 연락처, 상담대상</p>
                    <p>• 이용목적: 간병인 보험료 산출 및 무료 상담 안내</p>
                    <p>• 보유기간: 상담 완료 후 1년 (동의 철회 시 즉시 파기)</p>
                  </div>
                )}
              </div>

              {/* 에러 메시지 */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-lg sm:text-xl py-4 rounded-2xl shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? '접수 중입니다...' : '무료로 내 간병비 보험료 확인하기'}</span>
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>입력하신 정보는 암호화되어 안전하게 보호됩니다.</span>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* 7. 푸터 */}
      <footer className="bg-slate-900 text-slate-400 pt-12 pb-28 md:py-12 px-4 sm:px-6 border-t border-slate-800 mt-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="shrink-0">
              <svg className="h-11 sm:h-12 w-auto" viewBox="0 0 360 105" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="heartBlueFooter" x1="15" y1="20" x2="55" y2="85" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00C6FF"/>
                    <stop offset="100%" stopColor="#0052D4"/>
                  </linearGradient>
                  <linearGradient id="heartGreenFooter" x1="55" y1="15" x2="95" y2="85" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#B4EC51"/>
                    <stop offset="100%" stopColor="#429321"/>
                  </linearGradient>
                  <linearGradient id="goldPlusFooter" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FDE047"/>
                    <stop offset="100%" stopColor="#F59E0B"/>
                  </linearGradient>
                  <linearGradient id="swooshGradFooter" x1="100" y1="80" x2="340" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.1"/>
                    <stop offset="50%" stopColor="#7DD3FC"/>
                    <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path d="M52 86C52 86 16 64 16 37C16 23 27 14 39 14C46 14 51 18 54 23C50 28 48 35 51 44C54 53 60 66 52 86Z" fill="url(#heartBlueFooter)"/>
                <path d="M52 86C52 86 92 62 92 35C92 21 81 12 69 12C61 12 56 17 54 23C59 29 61 38 56 50C51 62 43 76 52 86Z" fill="url(#heartGreenFooter)"/>
                <path d="M48 88C64 78 82 62 96 46C83 66 66 81 48 88Z" fill="#84CC16"/>
                <circle cx="43" cy="36" r="5.5" fill="#0369A1"/>
                <path d="M33 56C33 48 37 44 43 44C49 44 53 48 53 56" fill="#0369A1"/>
                <circle cx="64" cy="39" r="5" fill="#075985"/>
                <path d="M55 58C55 51 59 47 64 47C69 47 73 51 73 58" fill="#075985"/>
                <circle cx="53.5" cy="48" r="4.2" fill="#0284C7"/>
                <path d="M46 64C46 58 49 55 53.5 55C58 55 61 58 61 64" fill="#0284C7"/>
                <path d="M97 8L99.5 16.5L108 19L99.5 21.5L97 30L94.5 21.5L86 19L94.5 16.5L97 8Z" fill="#FBBF24"/>
                <g transform="skewX(-8)">
                  <text x="114" y="66" fontFamily="sans-serif" fontWeight="900" fontSize="40" letterSpacing="-1.5" fill="#FFFFFF">보험</text>
                  <text x="190" y="66" fontFamily="sans-serif" fontWeight="900" fontSize="40" letterSpacing="-1.5" fill="#FBBF24">플러스</text>
                </g>
                <path d="M322 22H331V31H340V40H331V49H322V40H313V31H322V22Z" fill="url(#goldPlusFooter)"/>
                <path d="M105 78C165 70 265 70 335 78C265 74 165 74 105 78Z" fill="url(#swooshGradFooter)"/>
                <text x="220" y="94" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="11.5" letterSpacing="1.5" fill="#CBD5E1">— 당신의 행복을 지키는 보험 —</text>
              </svg>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              20년 경력의 전문가가 고객의 입장에서 정직하게 비교하고 설계합니다.
            </p>
          </div>

          <div className="pt-6 text-xs leading-relaxed space-y-1.5 text-slate-400">
            <p className="font-bold text-slate-300">[보험계약 체결 전 필수 안내사항]</p>
            <p>• 보험계약자가 기존에 체결했던 보험계약을 해지하고 다른 보험계약을 체결하면 보험인수가 거절되거나 보험료가 인상되거나 보장내용이 달라질 수 있습니다.</p>
            <p>• 지급한도, 면책사항 등에 따라 보험금 지급이 제한될 수 있으며, 계약 체결 전 반드시 상품설명서 및 약관을 읽어보시기 바랍니다.</p>
            <p>• 본 광고는 광고심의기준을 준수하였으며, 유효기간은 심의일로부터 1년입니다.</p>
            <p className="pt-3 text-slate-500">© 2026 보험플러스 (Boheom Plus). All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 성공 모달 */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 sm:p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">무료 견적 신청 완료!</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              <strong className="text-slate-900">{successData.userName}</strong>님의 간병비 보험 비교 요청이 정상 접수되었습니다.<br />
              담당 전문가가 확인 후 빠르게 연락드리겠습니다.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 mb-6 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">상담대상</span>
                <span className="font-bold text-slate-800">{successData.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">생년월일/성별</span>
                <span className="font-bold text-slate-800">{successData.birthDate} ({successData.gender})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">연락처</span>
                <span className="font-bold text-slate-800">{successData.userPhone}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessData(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 관리자 모달 */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> 상담 접수 관리자 센터
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {!isAdminAuthenticated ? (
              <div className="py-8 text-center space-y-4">
                <p className="text-sm text-slate-600">관리자 비밀번호를 입력하세요. (기본 비밀번호: 1234 또는 아무 숫자)</p>
                <div className="max-w-xs mx-auto flex gap-2">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-600"
                  />
                  <button
                    onClick={() => {
                      if (adminPassword) setIsAdminAuthenticated(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm"
                  >
                    로그인
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500">총 접수 건수: <strong className="text-blue-600">{leads.length}</strong>건</span>
                  <button onClick={fetchLeads} className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-bold">
                    <RefreshCw className="w-3.5 h-3.5" /> 새로고침
                  </button>
                </div>

                {leads.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    아직 접수된 상담 내역이 없습니다.
                  </div>
                ) : (
                  leads.map((lead, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5">
                      <div className="flex justify-between items-center font-bold text-slate-800 text-sm">
                        <span>{lead.userName} ({lead.gender}, {lead.birthDate})</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{lead.target}</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-2">
                        <span>연락처: <strong className="text-slate-900">{lead.userPhone}</strong></span>
                      </div>
                      <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-200/60">
                        접수시간: {lead.createdAt ? new Date(lead.createdAt).toLocaleString('ko-KR') : '방금 전'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 모바일 하단 고정 플로팅 CTA 버튼 */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white/95 to-transparent md:hidden pointer-events-none">
        <a
          href="#consult-form"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="pointer-events-auto w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-base py-3.5 px-6 rounded-2xl shadow-xl shadow-slate-900/20 border border-amber-400/80 transition"
        >
          <Calculator className="w-5 h-5" />
          <span>무료 견적 받기</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

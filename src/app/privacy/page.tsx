import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/LegalPage";
import { CONTACT_EMAIL, OPERATOR_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "포푸체크가 처리하는 개인정보의 항목, 목적, 보유기간과 국외 이전에 대해 안내합니다.",
  alternates: { canonical: "/privacy" },
};

// Keep this page in sync with what the code actually does:
// - /api/analyze forwards photo + pet info to Anthropic and stores nothing
// - src/lib/usage.ts keeps IP/device counters ~26h and aggregate stats ~120 days
// - pet profile, history and device id live only in the browser's localStorage

const OUTSOURCING = [
  {
    company: "Anthropic, PBC",
    country: "미국",
    task: "배변 사진 AI 분석",
    items: "배변 사진, 반려견 정보(이름·나이·품종, 입력한 경우)",
    when: "분석을 요청할 때 네트워크로 전송",
    keep: "Anthropic 정책에 따라 최대 30일 보관 후 삭제",
  },
  {
    company: "Vercel Inc.",
    country: "미국",
    task: "웹사이트 호스팅·서버 운영, 방문 통계",
    items: "IP 주소, 브라우저·기기 정보, 접속 일시, 분석 요청 데이터(전송 경유)",
    when: "서비스에 접속할 때 네트워크로 전송",
    keep: "Vercel 정책에 따름 (방문 통계는 쿠키 없이 처리되며 방문 세션은 24시간 후 폐기)",
  },
  {
    company: "Upstash, Inc.",
    country: "업체 소재지 미국 · 데이터 저장 일본(도쿄)",
    task: "하루 분석 횟수 제한, 이용 통계 저장",
    items: "IP 주소, 기기 식별값, 날짜별 이용 횟수와 집계 통계",
    when: "분석을 요청할 때 네트워크로 전송",
    keep: "횟수 제한 정보 최대 26시간, 집계 통계 약 4개월",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage title="개인정보처리방침">
      <LegalSection title="들어가며">
        <p>
          {OPERATOR_NAME}(이하 &lsquo;운영자&rsquo;)는 포푸체크 서비스(이하 &lsquo;서비스&rsquo;)를 이용하는 분의 개인정보를
          소중히 다루며, 「개인정보 보호법」에 따라 아래와 같이 개인정보처리방침을 공개합니다.
        </p>
        <p>
          포푸체크는 <strong>회원가입 없이</strong> 이용하는 서비스로, 이름·연락처·이메일 같은 회원 정보를 받지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="1. 처리하는 개인정보와 목적, 보유기간">
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-stone-800">① 사진 분석</p>
            <LegalList
              items={[
                "항목: 배변 사진, 반려견 정보(이름·나이·품종 — 입력한 경우에만)",
                "목적: 배변 상태 분석 결과 제공",
                "보유기간: 운영자 서버에는 저장하지 않습니다. 분석을 맡긴 Anthropic이 자사 정책에 따라 최대 30일 보관 후 삭제합니다.",
              ]}
            />
          </div>
          <div>
            <p className="font-semibold text-stone-800">② 하루 분석 횟수 제한 (서비스 남용 방지)</p>
            <LegalList
              items={[
                "항목: IP 주소, 기기 식별값(브라우저에서 무작위로 만든 값으로, 이름 등과 연결되지 않습니다)",
                "목적: 하루 분석 횟수를 세어 과도한 사용과 비용 남용을 막기 위함",
                "보유기간: 최대 26시간 후 자동 삭제",
              ]}
            />
          </div>
          <div>
            <p className="font-semibold text-stone-800">③ 이용 통계</p>
            <LegalList
              items={[
                "항목: 날짜별 분석 수, 판정 결과별 수, 동물병원 찾기·요약 공유 버튼 사용 수 등 집계 숫자 (개인을 알아볼 수 있는 정보는 포함하지 않습니다)",
                "목적: 서비스 품질 개선",
                "보유기간: 약 4개월",
              ]}
            />
          </div>
          <div>
            <p className="font-semibold text-stone-800">④ 접속 기록</p>
            <LegalList
              items={[
                "항목: IP 주소, 브라우저·기기 정보, 접속 일시 등 서비스 이용 과정에서 자동으로 생성되는 정보",
                "목적: 서비스 제공, 오류 확인과 보안",
                "보유기간: 호스팅 사업자(Vercel)의 정책에 따름",
              ]}
            />
          </div>
        </div>
      </LegalSection>

      <LegalSection title="2. 이용자 기기에만 저장되는 정보">
        <p>아래 정보는 이용자의 브라우저(기기) 안에만 저장되며, 운영자가 수집하거나 볼 수 없습니다.</p>
        <LegalList
          items={[
            "반려견 프로필(이름·나이·품종)",
            "분석 기록과 작게 줄인 사진",
            "기기 식별값, 오늘 남은 분석 횟수",
          ]}
        />
        <p>
          기록 화면의 삭제 기능이나 브라우저 설정의 &lsquo;사이트 데이터 삭제&rsquo;로 언제든 지울 수 있습니다. 기기를 바꾸거나
          데이터를 지우면 복구할 수 없습니다.
        </p>
      </LegalSection>

      <LegalSection title="3. 개인정보의 제3자 제공">
        <p>운영자는 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따라 요구되는 경우는 예외로 합니다.</p>
      </LegalSection>

      <LegalSection title="4. 처리 위탁과 국외 이전">
        <p>
          서비스 제공을 위해 아래 업체에 개인정보 처리를 맡기며, 이 업체들과 데이터 저장 위치는 국외(미국·일본)에 있습니다. 국외 이전은 서비스 이용
          계약을 이행하기 위한 처리 위탁·보관으로서 「개인정보 보호법」 제28조의8 제1항 제3호에 근거합니다.
        </p>
        <div className="space-y-3">
          {OUTSOURCING.map((o) => (
            <div key={o.company} className="rounded-xl bg-stone-50 px-4 py-3 space-y-0.5">
              <p className="font-semibold text-stone-800">
                {o.company} <span className="font-normal text-stone-500">({o.country})</span>
              </p>
              <p>위탁 업무: {o.task}</p>
              <p>이전 항목: {o.items}</p>
              <p>이전 시기·방법: {o.when}</p>
              <p>보유기간: {o.keep}</p>
            </div>
          ))}
        </div>
        <p>
          국외 이전을 원하지 않으면 사진 분석을 요청하지 않으면 됩니다. 이 경우 사진 분석 기능은 이용할 수 없지만, 증상별 가이드
          등 나머지 정보는 볼 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 개인정보의 파기">
        <LegalList
          items={[
            "보유기간이 끝난 정보는 저장소에 설정된 만료 시간에 따라 자동으로 삭제됩니다.",
            "사진은 운영자 서버에 저장하지 않으므로 별도로 파기할 사진이 남지 않습니다.",
            "전자 파일 형태로만 처리하며, 복구할 수 없는 방법으로 삭제합니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. 이용자의 권리와 행사 방법">
        <p>
          이용자는 언제든지 개인정보의 열람·정정·삭제·처리정지를 요구할 수 있으며, 아래 이메일로 요청하시면 지체 없이
          처리하겠습니다. 다만 운영자는 회원 정보를 보관하지 않아, 요청하신 분의 정보를 특정하기 어려운 경우가 있습니다.
        </p>
        <p>기기에 저장된 정보는 2항의 방법으로 이용자가 직접 삭제할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="7. 쿠키 등 자동 수집 장치">
        <p>
          서비스는 쿠키를 사용하지 않습니다. 프로필·기록 저장에는 브라우저의 로컬 저장소(localStorage)를 사용하며, 브라우저
          설정에서 삭제할 수 있습니다. 방문 통계(Vercel Web Analytics)는 쿠키 없이 동작합니다.
        </p>
      </LegalSection>

      <LegalSection title="8. 민감정보와 사진 이용 시 주의">
        <p>
          운영자는 민감정보를 수집하지 않습니다. 사진에 사람의 얼굴이나 주소처럼 개인을 알아볼 수 있는 내용이 찍히지 않도록
          반려견의 배변만 촬영해 주세요.
        </p>
      </LegalSection>

      <LegalSection title="9. 안전성 확보 조치">
        <LegalList
          items={[
            "모든 통신은 암호화(HTTPS)하여 전송합니다.",
            "사진은 분석에만 사용하고 운영자 서버에 저장하지 않습니다.",
            "API 키와 관리용 비밀값은 접근을 제한한 환경 설정에만 보관합니다.",
            "보관 정보는 최소한으로 하고, 만료 시간을 정해 자동 삭제합니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="10. 개인정보 보호책임자">
        <LegalList
          items={[
            `책임자: ${OPERATOR_NAME}`,
            <>
              이메일:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                {CONTACT_EMAIL}
              </a>
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="11. 권익침해 구제 방법">
        <p>개인정보 침해에 대한 상담이나 신고가 필요하면 아래 기관에 문의할 수 있습니다.</p>
        <LegalList
          items={[
            "개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)",
            "개인정보침해신고센터: 118 (privacy.kisa.or.kr)",
            "대검찰청: 1301 (www.spo.go.kr)",
            "경찰청: 182 (ecrm.police.go.kr)",
          ]}
        />
      </LegalSection>

      <LegalSection title="12. 개인정보처리방침의 변경">
        <p>이 방침이 바뀌는 경우 시행 전에 서비스 화면을 통해 알려드립니다.</p>
      </LegalSection>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection } from "@/components/LegalPage";
import { CONTACT_EMAIL, OPERATOR_NAME } from "@/lib/site";
import { LIMITS } from "@/lib/limits";

export const metadata: Metadata = {
  title: "이용약관",
  description: "포푸체크 서비스 이용약관입니다.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="이용약관">
      <LegalSection title="제1조 (목적)">
        <p>
          이 약관은 {OPERATOR_NAME}(이하 &lsquo;운영자&rsquo;)가 제공하는 포푸체크 서비스(이하 &lsquo;서비스&rsquo;)의 이용 조건과
          운영자와 이용자의 권리·의무를 정하는 것을 목적으로 합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조 (서비스 내용)">
        <p>운영자는 회원가입 없이 무료로 다음 서비스를 제공합니다.</p>
        <LegalList
          items={[
            "반려견 배변 사진을 AI로 분석해 참고용 판정과 설명을 제공",
            "분석 기록 보관(이용자 기기에 저장)과 수의사에게 보여줄 요약 공유",
            "배변 상태별 정보(가이드)와 지도 앱을 통한 동물병원 찾기 연결",
          ]}
        />
      </LegalSection>

      <LegalSection title="제3조 (의료적 판단에 대한 안내)">
        <p className="font-semibold text-stone-800">
          서비스의 분석 결과와 정보는 참고용이며, 수의사의 진단이나 치료를 대신하지 않습니다.
        </p>
        <LegalList
          items={[
            "AI 분석은 사진의 품질, 조명, 각도 등에 따라 틀릴 수 있습니다.",
            "반려견의 상태가 걱정되거나 증상이 계속되면 판정 결과와 관계없이 동물병원에 문의하세요.",
            "응급 증상이 있으면 서비스 결과를 기다리지 말고 즉시 동물병원에 연락하세요.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제4조 (이용 제한)">
        <LegalList
          items={[
            `안정적인 운영을 위해 사진 분석은 기기당 하루 ${LIMITS.perDevice}회 등으로 제한하며, 운영자는 이용 상황에 따라 이 기준을 조정할 수 있습니다.`,
            "자동화된 방법으로 대량 요청을 보내거나 서비스 운영을 방해하는 경우 이용을 제한할 수 있습니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제5조 (이용자의 의무)">
        <LegalList
          items={[
            "반려동물 배변 사진 분석이라는 서비스 목적에 맞게 이용해야 합니다.",
            "사람의 얼굴 등 다른 사람의 개인정보나 권리를 침해하는 사진을 올리지 않아야 합니다.",
            "서비스의 정상적인 운영을 방해하거나 보안을 해치는 행위를 해서는 안 됩니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제6조 (사진과 콘텐츠의 권리)">
        <LegalList
          items={[
            "이용자가 올린 사진의 권리는 이용자에게 있으며, 운영자는 분석 결과를 제공하는 범위에서만 사진을 처리합니다.",
            "서비스의 화면, 가이드 글 등 운영자가 만든 콘텐츠의 권리는 운영자에게 있습니다.",
          ]}
        />
        <p>
          개인정보의 처리에 관한 자세한 내용은{" "}
          <Link href="/privacy" className="underline">
            개인정보처리방침
          </Link>
          을 따릅니다.
        </p>
      </LegalSection>

      <LegalSection title="제7조 (서비스의 변경과 중단)">
        <p>
          운영자는 서비스의 내용을 바꾸거나, 운영상·기술상 필요에 따라 서비스를 중단할 수 있습니다. 중요한 변경이나 중단은
          가능한 한 미리 서비스 화면을 통해 알립니다.
        </p>
      </LegalSection>

      <LegalSection title="제8조 (책임의 제한)">
        <LegalList
          items={[
            "운영자는 무료로 제공되는 서비스와 관련하여, 운영자의 고의 또는 중대한 과실이 없는 한 이용자에게 생긴 손해에 대해 책임지지 않습니다.",
            "이용자가 분석 결과만을 근거로 수의사 진료를 받지 않아 생긴 결과에 대해서는 운영자의 고의 또는 중대한 과실이 없는 한 책임지지 않습니다.",
            "이용자 기기에만 저장되는 분석 기록이 기기 변경, 데이터 삭제 등으로 사라진 경우 운영자가 복구할 수 없습니다.",
            "서비스에서 연결하는 외부 서비스(카카오맵, 네이버지도 등)의 내용과 이용에 대해서는 해당 서비스의 약관이 적용됩니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제9조 (약관의 변경)">
        <p>
          운영자는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행일 7일 전부터 서비스 화면에
          알립니다. 이용자에게 불리한 변경은 시행일 30일 전부터 알립니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조 (준거법과 분쟁 해결)">
        <p>
          이 약관은 대한민국 법령에 따르며, 서비스 이용과 관련한 분쟁은 「민사소송법」에 따른 관할 법원에서 해결합니다. 문의는{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          로 보내주세요.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

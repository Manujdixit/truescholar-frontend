import React from "react";
import { getExamNewsById } from "@/api/individual/getExamNewsById";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import ExamHead from "@/components/page/exam/ExamHead";
import ExamNav from "@/components/page/exam/ExamNav";
import Image from "next/image";
import { createSlugFromTitle } from "@/components/utils/utils";
import "@/app/styles/tables.css";

const formatDateWord = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const trimText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string }>;
}): Promise<{
  title: string;
  description?: string;
  keywords?: string;
  alternates?: object;
  openGraph?: object;
}> {
  const params = await props.params;
  const slugId = params["slug-id"];
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return { title: "Exam Not Found" };

  const examId = Number(match[2]);
  if (isNaN(examId)) return { title: "Invalid Exam" };

  const exam = await getExamNewsById(examId);
  if (!exam) return { title: "Exam Not Found" };

  const { examInformation, news_section } = exam;
  const { exam_name, slug } = examInformation;
  const newsItem = news_section?.[0];
  const examSlug = slug.replace(/-\d+$/, "");

  return {
    title: newsItem?.title || `${exam_name} News`,
    description:
      newsItem?.meta_desc || `Latest news and updates from ${exam_name}.`,
    keywords:
      newsItem?.seo_param || `${exam_name}, news, exam updates, education`,
    alternates: {
      canonical: `https://www.truescholar.in/exams/${examSlug}-${examId}/news`,
    },
    openGraph: {
      title: newsItem?.title || `${exam_name} News`,
      description:
        newsItem?.meta_desc || `Latest news and updates from ${exam_name}.`,
      url: `https://www.truescholar.in/exams/${examSlug}-${examId}/news`,
    },
  };
}

const ExamNews = async ({
  params,
}: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const { "slug-id": slugId } = await params;
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return notFound();

  const examId = Number(match[2]);
  if (isNaN(examId)) return notFound();

  const exam = await getExamNewsById(examId);
  if (!exam?.examInformation || !exam?.news_section) return notFound();

  const { examInformation, news_section } = exam;

  const newsList = exam.news_section;
  const examName = exam.examInformation?.exam_name || "Unknown Exam";
  const trimmedExamName =
    exam.examInformation?.slug?.replace(/-\d+$/, "") ||
    examName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${trimmedExamName}-${examId}`;

  if (slugId !== correctSlugId) {
    redirect(`/exams/${correctSlugId}/news`);
  }

  if (!newsList || newsList.length === 0) {
    return notFound();
  }

  // Use the full examInformation object for ExamHead

  const jsonLD = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: examName,
      logo: exam.examInformation?.exam_logo,
      url: `https://www.truescholar.in/exams/${correctSlugId}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.truescholar.in",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Exams",
          item: "https://www.truescholar.in/exams",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: examName,
          item: `https://www.truescholar.in/exams/${correctSlugId}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "News",
          item: `https://www.truescholar.in/exams/${correctSlugId}/news`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: newsList[0]?.title || `${examName} News`,
      description: newsList[0]?.meta_desc || `Latest updates from ${examName}.`,
      author: {
        "@type": "Person",
        name: newsList[0]?.author_name || "Unknown Author",
      },
      datePublished: newsList[0]?.updated_at,
      dateModified: newsList[0]?.updated_at,
      image:
        exam.examInformation?.exam_logo ||
        "https://www.truescholar.in/logo-dark.webp",
      publisher: {
        "@type": "Organization",
        name: "TrueScholar",
        logo: {
          "@type": "ImageObject",
          url: "https://www.truescholar.in/logo-dark.webp",
        },
      },
    },
  ];

  return (
    <div className="bg-gray-2 min-h-screen">
      <Script
        id="exam-news-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <ExamHead data={examInformation} title={`${examName} News`} />
      <ExamNav data={exam} />
      <div className="container-body lg:grid grid-cols-12 gap-4 pt-4">
        <div className="col-span-3 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
        </div>
        <div className="col-span-9 mt-4">
          <div className="flex gap-4 flex-col">
            {newsList.map(
              (newsItem: {
                id: number;
                title: string;
                updated_at: string;
                meta_desc?: string;
              }) => (
                <div
                  key={newsItem.id}
                  className="p-4 bg-white shadow-md rounded-2xl"
                >
                  <Link
                    href={`/exams/${correctSlugId}/news/${createSlugFromTitle(
                      newsItem.title
                    )}-${newsItem.id}`}
                  >
                    <h2 className="text-lg font-medium hover:underline">
                      {newsItem.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-gray-600">
                    {formatDateWord(newsItem.updated_at)}
                  </p>
                  {newsItem.meta_desc && (
                    <div
                      className="text-gray-700 mt-2"
                      dangerouslySetInnerHTML={{
                        __html: trimText(newsItem.meta_desc, 150),
                      }}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamNews;

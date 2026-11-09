// Hand-picked solutions from around the web for each interview question
// (articles, videos, papers, mock interviews). Source list: systemdesign.io's "Recommended Solutions".
// Format: slug -> [[label or '', url], …]. Empty labels get a name from the site (see Question.jsx).

export const questionResources = {
  'design-url-shortening-service-like-tinyurl': [
    ['Good overview', 'https://medium.com/@sandeep4.verma/system-design-scalable-url-shortener-service-like-tinyurl-106f30f23a82'],
    ['Good solution', 'https://designgurus.io/blog/url-shortening'],
    ['NeetCode solution', 'https://www.youtube.com/watch?v=qSJAvd5Mgio'],
    ['Another solution', 'https://blog.algomaster.io/p/design-a-url-shortener'],
  ],
  'design-pastebin': [
    ['Good solution', 'https://medium.com/codex/designing-pastebin-77e6e86172eb'],
    ['Good 20 min video solution', 'https://www.youtube.com/watch?v=V_yOcipUqUE'],
    ['Alternate solution', 'https://ujjwalbhardwaj.me/post/system-design-design-pastebin-text-storage-system'],
  ],
  'design-instagram': [
    ['', 'https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-instagram'],
    ['Community review of a design', 'https://www.reddit.com/r/leetcode/comments/1dva2ng/rate_my_system_design_for_instagram/'],
    ['Instagram design blueprint', 'https://www.linkedin.com/pulse/instagram-system-design-blueprint-crack-faang-rocky-bhatia-w4jtc/'],
    ['', 'https://www.youtube.com/watch?v=S2y9_XYOZsg'],
  ],
  'design-dropbox-or-google-drive': [
    ['Paper: Google File System', 'https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf'],
    ['Solution from ex-Meta engineer', 'https://www.youtube.com/watch?v=_UZ1ngy-kOI'],
    ['', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/dropbox'],
    ['Mock interview', 'https://www.tryexponent.com/courses/system-design-interviews/design-dropbox'],
  ],
  'design-facebook-messenger-or-whatsapp': [
    ['Design WhatsApp', 'https://hayksimonyan.substack.com/p/system-design-interview-design-whatsapp'],
    ['Chat application design', 'https://medium.com/@m.romaniiuk/system-design-chat-application-1d6fbf21b372'],
    ['Design a chat system', 'https://medium.com/@ishwarya1011.hidkimath/system-design-design-a-chat-system-e0056fb093d1'],
    ['', 'https://www.youtube.com/watch?v=-3Ge8EooS3g'],
  ],
  'design-twitter-for-millions-of-users': [
    ['Design Twitter', 'https://hayksimonyan.substack.com/p/system-design-interview-design-twitter'],
    ['', 'https://www.youtube.com/watch?v=S2y9_XYOZsg'],
    ['Designing Twitter', 'https://dev.to/zeeshanali0704/designing-twitter-a-system-design-interview-question-221e'],
  ],
  'design-youtube-or-netflix': [
    ['High-level overview', 'https://bytebytego.com/courses/system-design-interview/design-youtube'],
    ['Good solution', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/youtube'],
  ],
  'design-typeahead-suggestion-autocomplete': [
    ['Good overview', 'https://medium.com/double-pointer/system-design-interview-autocomplete-type-ahead-system-for-a-search-box-1ac968f9f121'],
    ['3 approaches', 'https://systemdesignschool.io/problems/typeahead/solution'],
    ['Great explanation', 'https://www.youtube.com/watch?v=MCKX3n4-UR4'],
  ],
  'design-an-api-rate-limiter': [
    ['Rate limiter design', 'https://www.tryexponent.com/blog/rate-limiter-system-design'],
    ['', 'https://www.youtube.com/watch?v=VzW41m4USGs'],
    ['Rate limiting fundamentals', 'https://blog.bytebytego.com/p/rate-limiting-fundamentals'],
    ['Design a rate limiter', 'https://medium.com/geekculture/system-design-design-a-rate-limiter-81d200c9d392'],
    ['', 'https://leetcode.com/discuss/interview-question/system-design/1616482/System-Design%3A-Rate-Limiter'],
  ],
  'design-a-metrics-logging-and-aggregation-system': [
    ['', 'https://www.youtube.com/watch?v=p_q-n09B8KA'],
    ['', 'https://www.youtube.com/watch?v=_KoiMoZZ3C8'],
    ['Ad click aggregator breakdown', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/ad-click-aggregator'],
    ['Logs for all of eBay', 'https://leetcode.com/discuss/interview-question/system-design/622704/Design-a-system-to-store-and-retrieve-logs-for-all-of-eBay'],
  ],
  'design-a-stream-processing-system-like-kafka': [
    ['Paper: Kafka', 'https://notes.stephenholiday.com/Kafka.pdf'],
    ['Apache Kafka from 10,000 feet', 'https://medium.com/better-programming/system-design-series-apache-kafka-from-10-000-feet-9c95af56f18d'],
    ['', 'https://www.youtube.com/watch?v=DU8o-OTeoCc'],
    ['', 'https://www.youtube.com/watch?v=HZklgPkboro'],
  ],
  'design-a-keyvalue-store': [
    ['Design of a key-value store', 'https://www.educative.io/courses/grokking-the-system-design-interview/design-of-a-key-value-store'],
    ['', 'https://www.youtube.com/watch?v=6fOoXT1HYxk'],
    ['Video playlist', 'https://www.youtube.com/playlist?list=PL1MM4yIzUdPm2L_Lz8gRa_q6ZElgNoArH'],
  ],
  'identify-k-most-shared-articles-in-time-windows': [
    ['LeetCode discussion', 'https://leetcode.com/discuss/interview-question/system-design/258398/design-top-shared-post-system-in-5mins1-hour1-day1-week'],
    ['Official Google mock interview', 'https://www.youtube.com/watch?v=S1DvEdR0iUo'],
    ['Great high-level overview', 'https://mecha-mind.medium.com/system-design-top-k-trending-hashtags-4e12de5bb846'],
    ['Solution from Meta engineer', 'https://www.youtube.com/watch?v=1lfktgZ9Eeo'],
    ['Text solution', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/top-k'],
  ],
  'design-web-crawler': [
    ['', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler'],
  ],
  'design-facebooks-news-feed': [
    ['', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed'],
  ],
  'design-yelp-or-nearby-friends': [
    ['Yelp solution', 'https://systemdesignschool.io/problems/yelp/solution'],
    ['', 'https://www.youtube.com/watch?v=yz1jtze4qr8'],
    ['', 'https://www.youtube.com/watch?v=M4lR_Va97cQ&t=884s'],
    ['', 'https://www.youtube.com/watch?v=LHuhvvlFxA0'],
  ],
  'system-to-collect-metrics-from-thousands-of-servers': [
    ['Real-time monitoring system', 'https://systemdesignschool.io/problems/realtime-monitoring-system/solution'],
    ['Archived article', 'https://archive.is/Eezec'],
  ],
  'design-google-calendar': [
    ['Google Calendar design', 'https://medium.com/@astha2798/system-design-google-calendar-94894ddc9839'],
    ['', 'https://www.youtube.com/watch?v=POfW0UULcyA'],
    ['', 'https://leetcode.com/discuss/post/305654/system-design-google-calendar-by-kthtes-ttur/'],
    ['Recurring events design', 'https://www.linkedin.com/pulse/tiny-system-design-google-calendar-like-app-recurring-rajesh-pillai/'],
  ],
  'design-a-distributed-queue-like-rabbitmq': [
    ['LeetCode discussion', 'https://leetcode.com/discuss/interview-question/system-design/206134/Amazon-or-System-Design-or-Design-a-Distributed-Message-queue'],
    ['Good detailed explanation', 'https://docs.google.com/document/d/1pOarvQbjzLd9tz5ZuxktyrYsZ41mbWba5_LUeFj65lI/edit?tab=t.0#heading=h.iq7ofd902vlf'],
    ['Mock interview', 'https://www.tryexponent.com/blog/distributed-message-queue-system-design-mock-interview'],
    ['Detailed explanation video', 'https://www.youtube.com/watch?v=iJLL-KPqBpM'],
  ],
  'design-google-analytics-dashboard-and-pipeline': [
    ['Real-time analytics (Microsoft)', 'https://leetcode.com/discuss/interview-question/system-design/562404/system-designmicrosoft-real-time-analytics'],
    ['', 'https://www.youtube.com/watch?v=kIcq1_pBQSY'],
    ['', 'https://www.youtube.com/watch?v=8_5Gve7aNRk'],
  ],
  'design-a-system-for-sorting-large-data-sets': [
    ['Distributed sorting', 'https://quanticdev.com/algorithms/distributed-computing/distributed-sorting/'],
    ['', 'https://www.youtube.com/watch?v=vgKjatRVtys'],
    ['', 'https://leetcode.com/discuss/interview-question/4807845/Microsoft-Interview/'],
  ],
  'top-k-elements-app-store-rankings-amazon-bestsellers': [
    ['', 'https://www.youtube.com/watch?v=1lfktgZ9Eeo'],
    ['', 'https://www.youtube.com/watch?v=RvZbdYvrFeg'],
    ['Top K / heavy hitters', 'https://serhatgiydiren.com/system-design-interview-top-k-problem-heavy-hitters/'],
    ['Critique of a top-K design', 'https://www.teamblind.com/post/Please-critique-my-system-design-for-Top-K-most-searched-terms-Cfrqhnhk'],
  ],
  'design-a-job-scheduler': [
    ['Popular LeetCode discussion', 'https://leetcode.com/discuss/general-discussion/1082786/System-Design%3A-Designing-a-distributed-Job-Scheduler-or-Many-interesting-concepts-to-learn'],
    ['Solution from Google engineer', 'https://www.youtube.com/watch?v=pzDwYHRzEnk'],
    ['High-level overview', 'https://blog.algomaster.io/p/design-a-distributed-job-scheduler'],
    ['Mock interview', 'https://interviewing.io/mocks/faang-system-design-job-scheduler'],
  ],
  'design-a-notification-service-at-scale': [
    ['Scalable notification service', 'https://blog.algomaster.io/p/design-a-scalable-notification-service'],
    ['Notification service', 'https://serhatgiydiren.com/system-design-interview-notification-service/'],
    ['', 'https://www.youtube.com/watch?v=bBTPZ9NdSk8'],
    ['', 'https://www.youtube.com/watch?v=J-5JozlYIqI'],
  ],
  'surge-pricing-system-uber': [
    ['Detailed write-up', 'https://docs.google.com/document/d/1uJpPuhO6vZK_VCxBYKbCJoQYrbFE9Ihrsfs919X8f40/edit?usp=sharing'],
    ['Another write-up', 'https://docs.google.com/document/d/1hfUmr8SpBMCkEMlOeXl6Y-H85PMzq-zd07Isb1ltWZE/edit?usp=sharing'],
  ],
  'design-eta-and-location-sharing-between-uber-driver-and-rider': [
    ['ML system design: ETA prediction', 'https://mecha-mind.medium.com/ml-system-design-eta-prediction-9dc8000fd86b'],
    ['Google Maps ETA compute', 'https://www.finalroundai.com/interview-questions/google-maps-eta-compute'],
    ['Live location tracking best practices', 'https://www.linkedin.com/pulse/building-live-location-tracking-app-best-practices-real-time-das-cuujc/'],
    ['Location tracking design (GitHub)', 'https://github.com/praveenkumardec89/location-tracking-system-design'],
  ],
  'design-a-hotel-booking-system': [
    ['Solution from FAANG engineer', 'https://www.youtube.com/watch?v=Ale7Fn921GQ'],
    ['Hotel reservation', 'https://bytebytego.com/courses/system-design-interview/hotel-reservation-system'],
    ['Good API and high-level design', 'https://javascript.plainenglish.io/how-to-design-a-hotel-booking-system-56ef18b6adfc'],
    ['High-level backend design video', 'https://www.youtube.com/watch?v=m67Mjbx6DMY'],
    ['Mock interview', 'https://www.tryexponent.com/blog/design-a-hotel-booking-service-system-design-interview-question-answer'],
  ],
  'design-an-ab-testing-system-like-optimizely': [
    ['Trustworthy A/B testing platform', 'https://chuan-zhang.medium.com/building-a-trustworthy-a-b-testing-platform-practical-guide-and-an-architecture-demonstration-332446724ba0'],
    ['How to design an A/B test system', 'https://xhinliang.medium.com/how-to-design-an-a-b-test-system-1450b06933f'],
    ['Homemade A/B testing engine', 'https://medium.com/studocu-techblog/recipe-for-implementing-a-homemade-a-b-testing-engine-2e95c97c8020'],
  ],
  'design-a-price-alert-system-for-amazon-or-stock-prices': [
    ['Stock price notification system', 'https://leetcode.com/discuss/interview-question/system-design/5745135/Design-Stock-price-Notification-System'],
    ['Price drop tracker', 'https://dilipkumar.medium.com/price-drop-tracker-system-design-d2f9ed36a935'],
    ['Amazon price tracker', 'https://www.tryexponent.com/questions/3371/design-amazon-price-tracker'],
  ],
  'design-an-ioc-or-dependency-injection-framework': [
    ['Intro to concepts', 'https://tarunjain07.medium.com/inversion-of-control-ioc-dependency-injection-di-9155a4151db9'],
    ['More info', 'https://www.finalroundai.com/blog/dependency-injection-interview-questions'],
    ['Video', 'https://www.youtube.com/watch?v=ryI8CA7Dbx8'],
  ],
  'design-a-credit-card-processing-system': [
    ['Designing a payment system', 'https://newsletter.pragmaticengineer.com/p/designing-a-payment-system'],
    ['Payment systems: follow-up questions', 'https://hackernoon.com/system-design-interview-designing-payment-systems-follow-up-questions-and-probable-issues'],
    ['', 'https://www.youtube.com/watch?v=olfaBgJrUBI'],
  ],
  'count-facebook-likes-especially-for-popular-users': [
    ['How FB/Insta store likes', 'https://www.teamblind.com/post/System-Design-Question-How-does-FBInsta-storeretrieve-likes-NZEcwqVp'],
    ['Distributed counter', 'https://systemdesign.one/distributed-counter-system-design/'],
    ['Live design: Facebook likes', 'https://blog.interviewcamp.io/live-design-facebook-likes-distributed-counter'],
  ],
  'design-a-control-plane-for-a-distributed-database': [
    ['', 'https://www.youtube.com/watch?v=Ep1QW-wOmgc'],
    ['Paper: Amazon Dynamo', 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'],
  ],
  'design-a-user-login-and-authentication-system': [
    ['Great explanation', 'https://www.youtube.com/watch?v=uj_4vxm9u90'],
    ['Good solution', 'https://hackernoon.com/designing-functional-authentication-and-authorization-systems'],
    ['Good summary', 'https://www.finalroundai.com/interview-questions/google-design-login-endpoint'],
    ['Explanation video', 'https://www.youtube.com/watch?v=fyTxwIa-1U0'],
    ['Explanation video', 'https://www.youtube.com/watch?v=zt8Cocdy15c'],
  ],
  'design-a-weather-application': [
    ['LeetCode discussion', 'https://leetcode.com/discuss/interview-question/system-design/1286344/system-design-design-weather-widget'],
    ['Video explanation with sensors', 'https://www.youtube.com/watch?v=sWNRuClDOo4&t=2s'],
    ['Another explanation with sensors', 'https://www.youtube.com/watch?v=PxL8W3WoK5k'],
  ],
  'create-a-document-management-system-like-wikipedia-or-notion': [
    ['Content management system design', 'https://leetcode.com/discuss/interview-question/system-design/322448/Content-Management-System-Design'],
    ['', 'https://www.youtube.com/watch?v=YCjVIDv0zQY'],
    ['', 'https://www.youtube.com/watch?v=tsGarhpWOws'],
  ],
  'build-a-marketplace-feature-for-facebook': [
    ['Cheat sheet', 'https://www.reddit.com/r/leetcode/comments/104wf74/system_design_cheatsheet_online_marketplace/'],
    ['Craigslist design', 'https://medium.com/@bugfreeai/system-design-interview-practice-design-craigslist-c95ba0238f74'],
    ['Mock interview', 'https://www.youtube.com/watch?v=2N0TXrgB9AY'],
  ],
  'design-a-system-to-monitor-the-health-of-a-cluster': [
    ['Good starting point: interview experience', 'https://medium.com/@ajingnv/system-design-a-server-health-monitoring-system-9bdd0066bb9c'],
    ['Solution', 'https://systemdesignschool.io/problems/realtime-monitoring-system/solution'],
    ['LeetCode discussion', 'https://leetcode.com/discuss/interview-question/system-design/958919/System-Design-Interview-or-Service-Health-Monitoring-and-Alerting-Service'],
  ],
  'find-a-rider-for-uber-or-uber-eats': [
    ['Spatial search algorithms', 'https://blog.mapbox.com/a-dive-into-spatial-search-algorithms-ebd0c5e39d2a'],
    ['Yelp solution (geo search)', 'https://systemdesignschool.io/problems/yelp/solution'],
    ['', 'https://www.youtube.com/watch?v=M4lR_Va97cQ'],
    ['', 'https://www.youtube.com/watch?v=atywHEArk1w'],
  ],
  'design-a-distributed-tracing-system': [
    ['LeetCode discussion', 'https://leetcode.com/discuss/interview-question/system-design/313117/Design-a-system-capable-of-tracking-bad-request-down-quickly'],
    ['Great intro to tracing', 'https://betterstack.com/community/guides/observability/distributed-tracing/'],
    ['Dapper research paper', 'https://research.google/pubs/pub36356/'],
    ['Solution from FAANG engineer', 'https://www.youtube.com/watch?v=Jkhw_FSikX0'],
  ],
  'design-backend-to-distribute-6-million-burgers-in-one-hour': [
    ['Mock interview', 'https://interviewing.io/mocks/google-system-design-design-a-free-food-app'],
    ['Another mock interview', 'https://interviewing.io/questions/design-a-free-food-app'],
    ['Reddit discussion', 'https://www.reddit.com/r/softwarearchitecture/comments/xlztzr/interview_systems_design_question_that_i_want/'],
  ],
  'design-a-file-downloader-library': [
    ['LeetCode discussion', 'https://leetcode.com/discuss/interview-question/system-design/1587255/Facebook-System-Design'],
    ['Video solution', 'https://www.youtube.com/watch?v=u520bdagKkU'],
  ],
  'design-a-system-to-view-latest-stock-prices': [
    ['Bloomberg: prices of a stock', 'https://leetcode.com/discuss/interview-question/system-design/431712/Bloomberg-or-Design-a-system-to-give-prices-of-a-stock'],
    ['Real-time stock price feed', 'https://harshsavasil.medium.com/design-real-time-stock-price-feed-9e1fba0a1c4e'],
    ['How Paytm Money built price alerts', 'https://www.paytmmoney.com/blog/how-we-built-an-in-house-price-alerts-system/'],
  ],
  'develop-a-photo-sharing-platform-like-flickr-or-google-photos': [
    ['Paper: Facebook Haystack', 'https://www.usenix.org/legacy/event/osdi10/tech/full_papers/Beaver.pdf'],
    ['Key points: photo sharing platform', 'https://medium.com/@bugfreeai/key-points-of-a-common-system-design-interview-question-photo-sharing-platform-91f52fa4bf05'],
    ['Picture sharing system', 'https://www.geeksforgeeks.org/design-a-picture-sharing-system-system-design/'],
    ['', 'https://www.youtube.com/watch?v=FUKGooQXih8'],
    ['Mock interview', 'https://interviewing.io/mocks/faang-system-design-photo-sharing-service'],
  ],
  'design-an-oncall-escalation-system': [
    ['Detailed write-up', 'https://docs.google.com/document/d/1yngBZD2xNYfPRMIy1haQQcpSrZLUrIjErIM92d8mFiA/edit?usp=sharing'],
  ],
  'design-and-implement-a-wire-transfer-api': [
    ['LeetCode discussion', 'https://leetcode.com/discuss/interview-question/1895724/google-first-phone-write-a-wiretransfer-api'],
    ['Revolut interview experience', 'https://leetcode.com/discuss/post/651695/revolut-backend-engineer-london-sep-2019-ybf3/'],
    ['Video solution', 'https://www.youtube.com/watch?v=olfaBgJrUBI&t=365s'],
  ],
  'design-a-live-comments-feature-for-facebook': [
    ['Great solution', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-live-comments'],
    ['Video solution from Meta engineer', 'https://www.youtube.com/watch?v=LjLx0fCd1k8'],
    ['FB engineering blog', 'https://engineering.fb.com/2011/02/07/core-infra/live-commenting-behind-the-scenes/'],
    ['LeetCode discussion', 'https://leetcode.com/discuss/post/583184/fbinstagram-live-comments-system-design-fqtzt/'],
  ],
  'design-a-feature-to-show-the-number-of-users-viewing-a-page': [
    ['Real-time active user counter', 'https://medium.com/@narasimha4789/from-zero-to-millions-designing-a-real-time-active-user-counter-system-a5d9545bd35e'],
    ['', 'https://www.youtube.com/watch?v=TuKjdj9YXns'],
  ],
  'design-facebook-likes-feature-with-live-updates': [
    ['', 'https://www.youtube.com/watch?v=T4bmFz-BSDk'],
  ],
  'create-a-system-to-migrate-large-data-to-google-cloud': [
    ['Migrating data without downtime', 'https://newrelic.com/blog/best-practices/migrating-data-to-cloud-avoid-downtime-strategies'],
    ['Rubrik file transfer question', 'https://leetcode.com/discuss/post/1733573/rubrik-file-transfer-interview-question-43hjl/'],
  ],
  'design-a-distributed-botnet': [
    ['Paper: MapReduce', 'https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf'],
    ['Facebook design round discussion', 'https://leetcode.com/discuss/post/1375361/botnet-system-designfacebook-design-roun-jv0g/'],
    ['Lyft onsite discussion', 'https://leetcode.com/discuss/post/850071/lyft-virtual-onsite-design-bots-to-downl-4v5q/'],
    ['Blind discussion', 'https://www.teamblind.com/post/System-design-for-Botnet-5x0Mq34z'],
  ],
  'create-a-distributed-file-transfer-system-like-bittorrent': [
    ['Paper: BitTorrent', 'https://web.cs.ucla.edu/classes/cs217/05BitTorrent.pdf'],
    ['The engineering behind BitTorrent', 'https://medium.com/@abhinavcv007/bittorrent-part-1-the-engineering-behind-the-bittorrent-protocol-04e70ee01d58'],
    ['', 'https://www.youtube.com/watch?v=6PWUCFmOQwQ'],
  ],
  'develop-ads-management-and-display-system-for-social-feed': [
    ['', 'https://www.youtube.com/watch?v=Zcv_899yqhI&t=2s'],
    ['Facebook/Instagram ad system', 'https://dilipkumar.medium.com/facebook-instagram-ad-system-design-e828296ae84a'],
  ],
}

// Turn a URL into a source name and kind for the badge.
const SOURCES = [
  ['youtube.com', 'YouTube', 'video'],
  ['hellointerview.com', 'Hello Interview', 'solution'],
  ['bytebytego.com', 'ByteByteGo', 'solution'],
  ['designgurus.io', 'DesignGurus', 'solution'],
  ['educative.io', 'Educative', 'course'],
  ['systemdesignschool.io', 'System Design School', 'solution'],
  ['algomaster.io', 'AlgoMaster', 'article'],
  ['tryexponent.com', 'Exponent', 'mock'],
  ['interviewing.io', 'interviewing.io', 'mock'],
  ['leetcode.com', 'LeetCode', 'discussion'],
  ['teamblind.com', 'Blind', 'discussion'],
  ['reddit.com', 'Reddit', 'discussion'],
  ['medium.com', 'Medium', 'article'],
  ['substack.com', 'Substack', 'article'],
  ['linkedin.com', 'LinkedIn', 'article'],
  ['docs.google.com', 'Google Doc', 'notes'],
  ['github.com', 'GitHub', 'repo'],
  ['engineering.fb.com', 'Meta Engineering', 'eng blog'],
]

export function describeResource([label, url]) {
  const host = new URL(url).hostname.replace(/^www\./, '')
  const known = SOURCES.find(([d]) => host === d || host.endsWith('.' + d))
  const isPaper = /\.pdf($|\?)/i.test(url) || /research\.google|usenix\.org/.test(host)
  const kind = isPaper ? 'paper' : known ? known[2] : 'article'
  const source = known ? known[1] : host
  const fallback = kind === 'video' ? 'Video solution' : kind === 'discussion' ? `${source} discussion` : `${source} write-up`
  return { label: label || fallback, url, kind, source }
}

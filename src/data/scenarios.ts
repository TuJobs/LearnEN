import type { Scenario } from '../types'

export const SCENARIOS: Scenario[] = [
  {
    id: 'standup',
    icon: '🧍',
    title: 'Daily stand-up',
    desc: 'Báo cáo công việc trong buổi họp 15 phút mỗi sáng.',
    steps: [
      {
        speaker: 'Anna (Scrum Master)',
        line: 'Good morning, everyone! Minh, would you like to start?',
        goal: 'Kể rằng hôm qua bạn đã làm xong API đăng nhập và đã mở PR.',
        options: [
          { text: 'Sure. Yesterday I finished the login API and opened a PR for it.', score: 2, note: 'Chuẩn! Quá khứ đơn cho việc hôm qua, kèm kết quả cụ thể (opened a PR).' },
          { text: 'Yesterday I have finished the login API and I have opened a PR for it already.', score: 0, note: 'Có ‘yesterday’ (mốc cụ thể trong quá khứ) thì dùng quá khứ đơn: ‘I finished… and opened…’, không dùng ‘have finished’.' },
          { text: 'Login API done.', score: 1, note: 'Hiểu được nhưng cộc lốc. Trong stand-up nên nói câu hoàn chỉnh.' },
        ],
      },
      {
        speaker: 'Anna (Scrum Master)',
        line: 'Great job. What are you working on today?',
        goal: 'Hôm nay bạn sẽ viết unit test cho API đó.',
        options: [
          { text: "I'll write unit tests for it.", score: 2, note: 'Ngắn mà đủ ý: ‘will’ + động từ nguyên mẫu, ‘tests’ số nhiều, và ‘it’ chính là API vừa nhắc tới.' },
          { text: 'Today I will writing unit test for the login API.', score: 0, note: 'Sau ‘will’ là động từ nguyên mẫu: ‘will write’. Và ‘tests’ nên ở số nhiều.' },
          { text: "Today I'll keep working on some testing stuff for the API, things like that.", score: 1, note: 'Đúng ngữ pháp nhưng dài mà vẫn mơ hồ: ‘some testing stuff’, ‘things like that’ không cho ai biết là bạn viết unit test.' },
        ],
      },
      {
        speaker: 'Anna (Scrum Master)',
        line: 'Any blockers?',
        goal: 'Bạn đang bị chặn vì chưa có quyền truy cập database staging.',
        options: [
          { text: "Yes, I'm blocked because I don't have access to the staging database yet.", score: 2, note: '‘I’m blocked because…’ là cách nói chuẩn khi báo blocker.' },
          { text: "Yes, I don't have permission staging DB.", score: 1, note: 'Hiểu được nhưng thiếu giới từ: ‘permission to access the staging DB’.' },
          { text: 'No problem.', score: 0, note: 'Đừng giấu blocker! Nói ra để được giúp sớm — đó chính là mục đích của stand-up.' },
        ],
      },
      {
        speaker: 'Anna (Scrum Master)',
        line: "Okay, I'll ask DevOps to give you access. Anything else?",
        goal: 'Cảm ơn và kết thúc phần của bạn.',
        options: [
          { text: "That's all from me. Thanks!", score: 2, note: 'Câu kết kinh điển trong stand-up.' },
          { text: "Thank you so much, I'm very appreciate.", score: 0, note: '‘appreciate’ là động từ: ‘I really appreciate it’.' },
          { text: 'I would like to inform everyone that I have no further updates. Thank you for your attention.', score: 1, note: 'Đúng ngữ pháp nhưng quá trang trọng cho stand-up, nghe như đọc diễn văn. Một câu ngắn gọn là đủ.' },
        ],
      },
    ],
  },
  {
    id: 'code-review',
    icon: '🔍',
    title: 'Code review',
    desc: 'Trả lời góp ý của reviewer trên pull request.',
    steps: [
      {
        speaker: 'Tom (Reviewer)',
        line: 'Why are you calling the API inside this loop? This will send 100 requests.',
        goal: 'Bạn đồng ý và sẽ sửa bằng cách gọi một request duy nhất (batch).',
        options: [
          { text: "Good catch! I'll batch those calls into a single request.", score: 2, note: '‘Good catch!’ = ‘phát hiện hay đấy’ — nhận góp ý tích cực, rồi nói luôn cách sửa: gộp thành một request.' },
          { text: 'Ok I will fix.', score: 1, note: 'Thiếu tân ngữ (‘fix it’) và không nói sẽ sửa thế nào.' },
          { text: 'Because it is more easy to code like this, and 100 requests is not so many for our server.', score: 0, note: 'Nghe phòng thủ, gạt đi vấn đề reviewer nêu ra. Lại sai so sánh hơn: ‘easier’, không phải ‘more easy’.' },
        ],
      },
      {
        speaker: 'Tom (Reviewer)',
        line: 'nit: the variable name `d` is not very descriptive.',
        goal: 'Đây là góp ý nhỏ (nit). Bạn đã đổi tên thành `deadline`.',
        options: [
          { text: 'Done, renamed it to `deadline`.', score: 2, note: 'Ngắn gọn, xác nhận đã xử lý — với một nit thì vậy là đủ.' },
          { text: "Sorry for the bad naming, that was my mistake. I've changed it to `deadline` now. I hope it's better.", score: 1, note: 'Đúng ngữ pháp nhưng xin lỗi quá mức cho một góp ý nhỏ. Với nit, chỉ cần xác nhận đã sửa.' },
          { text: "It's only a nit, so I think we can just leave it like this.", score: 0, note: 'Nit không bắt buộc sửa, nhưng gạt đi như vậy là thiếu tôn trọng reviewer — huống chi bạn đã đổi tên rồi.' },
        ],
      },
      {
        speaker: 'Tom (Reviewer)',
        line: 'Could you add a unit test for the empty list case?',
        goal: 'Bạn đã thêm test và muốn nhờ anh ấy xem lại.',
        options: [
          { text: "Done, I've added one. PTAL 🙏", score: 2, note: 'Hiện tại hoàn thành (I’ve added) + PTAL = Please Take A Look. Ngắn gọn, đúng kiểu comment trên PR.' },
          { text: 'I added test already, please review again for me.', score: 1, note: 'Hiểu được; tự nhiên hơn: ‘I’ve added a test. Could you take another look?’' },
          { text: "I don't think we need it, because the list is never empty in production.", score: 0, note: 'Gạt đi mà không có bằng chứng: ‘never empty’ hôm nay chưa chắc đúng ngày mai. Edge case như list rỗng rất đáng được test.' },
        ],
      },
      {
        speaker: 'Tom (Reviewer)',
        line: 'LGTM! Approved. ✅',
        goal: 'Cảm ơn reviewer và báo sẽ merge.',
        options: [
          { text: 'Thanks for the review! Merging now.', score: 2, note: 'Lịch sự, tự nhiên.' },
          { text: 'Thanks for your reviewing.', score: 1, note: 'Nói ‘Thanks for the review’ hoặc ‘Thanks for reviewing’.' },
          { text: 'Finally.', score: 0, note: '😅 Đúng là cảm xúc thật, nhưng đừng viết vậy trên PR.' },
        ],
      },
    ],
  },
  {
    id: 'client-incident',
    icon: '🚨',
    title: 'Báo sự cố cho khách hàng',
    desc: 'Khách hàng nước ngoài hỏi về sự cố đăng nhập trên production.',
    steps: [
      {
        speaker: 'Mr. Smith (Client)',
        line: "Hi team, users are reporting that they can't log in. What's going on?",
        goal: 'Xác nhận đã biết sự cố, đang điều tra, và hẹn cập nhật trong 30 phút.',
        options: [
          { text: "We're aware and looking into it now. I'll update you within 30 minutes.", score: 2, note: 'Chuyên nghiệp mà gọn: xác nhận + đang xử lý + mốc thời gian cập nhật.' },
          { text: 'Yes, we know. We are checking.', score: 1, note: 'Đúng nhưng hơi cụt; với khách hàng nên đưa mốc thời gian cập nhật.' },
          { text: "Hi Mr. Smith, we didn't change anything on our side today, so maybe the users typed the wrong password. Could you ask them to try again?", score: 0, note: 'Lịch sự nhưng đổ lỗi cho người dùng khi chưa điều tra — điều tối kỵ khi báo sự cố.' },
        ],
      },
      {
        speaker: 'Mr. Smith (Client)',
        line: 'Do you know the root cause?',
        goal: 'Nguyên nhân: chứng chỉ SSL hết hạn sáng nay.',
        options: [
          { text: 'Yes, our SSL certificate expired this morning.', score: 2, note: 'Trả lời thẳng vào nguyên nhân, đúng thì quá khứ (‘expired’) và gọi đúng tên ‘SSL certificate’.' },
          { text: 'The root cause is because the SSL certificate is expire from this morning.', score: 0, note: 'Sai ngữ pháp: ‘expired this morning’ chứ không phải ‘is expire from this morning’. Và ‘the root cause is because’ bị lặp ý, nói ‘the root cause is that…’.' },
          { text: "I think it's something related to the SSL on our server, but it's a bit complicated to explain.", score: 1, note: 'Đúng ngữ pháp nhưng vòng vo: khách hỏi nguyên nhân mà chỉ nhận được ‘something related to the SSL’. Biết là chứng chỉ hết hạn thì cứ nói thẳng.' },
        ],
      },
      {
        speaker: 'Mr. Smith (Client)',
        line: 'When will it be fixed?',
        goal: 'Bạn ước tính sẽ xong trong vòng 1 giờ.',
        options: [
          { text: 'We expect to have it fixed within an hour.', score: 2, note: '‘have it fixed’ + mốc thời gian rõ ràng, nghe tự tin.' },
          { text: "Maybe one hour, I'm not sure.", score: 1, note: 'Chấp nhận được nhưng nghe thiếu tự tin.' },
          { text: 'ASAP.', score: 0, note: 'Với khách hàng nên đưa thời gian cụ thể thay vì ‘ASAP’.' },
        ],
      },
      {
        speaker: 'Mr. Smith (Client)',
        line: 'Okay. How will you prevent this from happening again?',
        goal: 'Bạn sẽ cài cảnh báo tự động 30 ngày trước khi chứng chỉ hết hạn.',
        options: [
          { text: "We'll set up automatic alerts 30 days before the certificate expires.", score: 2, note: 'Giải pháp cụ thể; ‘set up’ là động từ nên viết rời.' },
          { text: "We'll setup alert.", score: 1, note: 'Động từ viết rời ‘set up’, và ‘alerts’ nên ở số nhiều.' },
          { text: 'We will careful next time.', score: 0, note: 'Thiếu ‘be’ (‘will be careful’) và không có giải pháp cụ thể.' },
        ],
      },
    ],
  },
  {
    id: 'interview',
    icon: '🎤',
    title: 'Phỏng vấn xin việc',
    desc: 'Vòng phỏng vấn tiếng Anh với công ty nước ngoài.',
    steps: [
      {
        speaker: 'Interviewer',
        line: 'Can you tell me a little bit about yourself?',
        goal: 'Giới thiệu: backend developer, 3 năm kinh nghiệm, chủ yếu dùng Node.js.',
        options: [
          { text: "Sure! I'm a backend developer with three years of experience, mostly working with Node.js.", score: 2, note: 'Tập trung vào vai trò, kinh nghiệm và công nghệ chính — đúng thứ người phỏng vấn cần.' },
          { text: 'I have 3 years experiences in backend.', score: 0, note: '‘experience’ (kinh nghiệm) không đếm được: ‘three years of experience’.' },
          { text: "My name is Minh. I'm 25 years old, I graduated from university in 2022, and in my free time I like coding, reading and playing football.", score: 1, note: 'Đúng ngữ pháp nhưng giống bài giới thiệu ở trường: tuổi, sở thích không phải điều người phỏng vấn cần. Hãy nói về kinh nghiệm và kỹ năng.' },
        ],
      },
      {
        speaker: 'Interviewer',
        line: "What's the most challenging project you've worked on?",
        goal: 'Kể về việc tối ưu một API, giảm độ trễ từ 2 giây xuống 200ms.',
        options: [
          { text: 'I optimized a slow API and reduced its latency from 2 seconds to 200 milliseconds.', score: 2, note: 'Có số liệu cụ thể — người phỏng vấn rất thích điều này.' },
          { text: 'I worked on an API that was very slow, and I made it faster.', score: 1, note: 'Đúng, nhưng thiếu con số để chứng minh.' },
          { text: 'The most challenge project is when I make our API faster very much, from 2 seconds become 200 milliseconds.', score: 0, note: 'Có số liệu nhưng sai nhiều chỗ: ‘most challenging’, thì quá khứ ‘made’, ‘much faster’ chứ không phải ‘faster very much’, và ‘from… to…’ chứ không dùng ‘become’.' },
        ],
      },
      {
        speaker: 'Interviewer',
        line: 'How do you handle disagreements in code review?',
        goal: 'Bạn lắng nghe và bảo vệ ý kiến bằng dữ liệu.',
        options: [
          { text: 'I listen first, then back up my point with data.', score: 2, note: 'Ngắn mà cân bằng: lắng nghe trước, rồi bảo vệ ý kiến bằng dữ liệu. ‘back up’ (động từ) = củng cố.' },
          { text: "I always respect the reviewer's opinion, so usually I just follow what they say, because I don't want any conflict in the team.", score: 1, note: 'Nghe hoà nhã nhưng thiếu chính kiến; người phỏng vấn muốn biết bạn bảo vệ quan điểm của mình thế nào.' },
          { text: 'I explain my idea again and again until the reviewer agrees with me.', score: 0, note: 'Cờ đỏ về kỹ năng làm việc nhóm: lặp lại tới khi người kia chịu thua là ‘cãi’, không phải thuyết phục.' },
        ],
      },
      {
        speaker: 'Interviewer',
        line: 'Do you have any questions for us?',
        goal: 'Hỏi về quy trình phát triển của team.',
        options: [
          { text: "Yes, what's the team's development process like?", score: 2, note: 'Thể hiện sự quan tâm tới công việc thực tế. ‘What’s… like?’ = ‘… như thế nào?’' },
          { text: 'Yes, how much is the salary, and how many days off do I get?', score: 1, note: 'Đúng ngữ pháp nhưng hỏi ngay lương và ngày nghỉ dễ khiến bạn trông chỉ quan tâm quyền lợi; nên để vòng sau.' },
          { text: 'No, I think everything is clear already. Thank you for your time today.', score: 0, note: 'Lịch sự nhưng bỏ lỡ cơ hội: không hỏi gì dễ bị xem là thiếu quan tâm. Luôn chuẩn bị sẵn 1–2 câu hỏi.' },
        ],
      },
    ],
  },
  {
    id: 'sprint-planning',
    icon: '🃏',
    title: 'Sprint planning',
    desc: 'Ước lượng story point và chốt khối lượng việc cho sprint mới.',
    steps: [
      {
        speaker: 'Linda (Product Owner)',
        line: "Next up is the 'Export orders to CSV' story. Any questions before we estimate?",
        goal: 'Hỏi xem file export có phải xử lý hơn 100.000 dòng không, vì điều đó ảnh hưởng tới cách làm.',
        options: [
          { text: 'Just one: does the export need to handle more than 100,000 rows? That changes the approach quite a bit.', score: 2, note: 'Hỏi đúng điểm ảnh hưởng tới ước lượng, và nói luôn vì sao mình hỏi.' },
          { text: 'How many rows the export has?', score: 1, note: 'Hiểu được nhưng sai trật tự câu hỏi: ‘How many rows will the export have?’' },
          { text: 'No question, I can do it.', score: 0, note: 'Nhận việc khi chưa rõ yêu cầu là nguồn gốc của những lần ước lượng sai.' },
        ],
      },
      {
        speaker: 'Ken (Scrum Master)',
        line: 'Some clients have around 500,000 orders. Okay, cards up! Minh, you voted 8 while most people voted 3. Can you explain?',
        goal: 'Giải thích: với 500.000 dòng không thể tạo file ngay trong một request, cần chạy job nền và báo cho người dùng khi xong.',
        options: [
          { text: "Sure. With 500,000 rows, we can't generate the file in a single request, so we'd need a background job and a way to notify the user when it's ready.", score: 2, note: 'Lý do kỹ thuật rõ ràng — đúng mục đích của planning poker: làm lộ ra rủi ro mà người khác chưa thấy.' },
          { text: "Because it's big data, very complicated.", score: 1, note: 'Có ý nhưng mơ hồ; nên nói cụ thể phức tạp ở chỗ nào.' },
          { text: 'Sorry, maybe I estimated too high. I will change my vote to 3 like everyone.', score: 0, note: 'Đừng đổi điểm theo số đông khi bạn thấy rủi ro mà người khác chưa thấy — hãy giải thích lý do.' },
        ],
      },
      {
        speaker: 'Ken (Scrum Master)',
        line: "That makes sense. Let's re-vote... Okay, 8 points it is. Can you take this story?",
        goal: 'Bạn nhận, nhưng báo trước rằng thứ Sáu bạn nghỉ nên sprint này bạn có ít thời gian hơn.',
        options: [
          { text: "Sure, but heads-up: I'm off on Friday, so my capacity is a bit lower this sprint.", score: 2, note: '‘heads-up’ + ‘capacity’: báo trước rủi ro ngay từ lúc lên kế hoạch là rất chuyên nghiệp.' },
          { text: "OK, but Friday I'm off.", score: 1, note: 'Hiểu được nhưng cụt, và chưa nói rõ việc nghỉ ảnh hưởng thế nào tới sprint.' },
          { text: 'OK, I can take it, but I will off on Friday, so this sprint I have less time than other people.', score: 0, note: 'Đủ ý nhưng sai ngữ pháp: ‘off’ không phải động từ. Nói ‘I’ll be off on Friday’ hoặc ‘I’m taking Friday off’.' },
        ],
      },
      {
        speaker: 'Linda (Product Owner)',
        line: "So we're committing to 34 points this sprint. Is everyone comfortable with that?",
        goal: 'Bạn thấy hơi nhiều, đề xuất đưa story dark mode về lại backlog để có khoảng dự phòng.',
        options: [
          { text: 'It feels a bit tight. Could we move dark mode back to the backlog to leave some buffer?', score: 2, note: 'Nêu lo ngại thẳng thắn nhưng lịch sự, kèm đề xuất cụ thể. ‘buffer’ = khoảng dự phòng.' },
          { text: "Hmm, I'm not 100% sure, but maybe it's a little bit too much for us? But it's OK, we can try our best and see what happens.", score: 1, note: 'Nêu lo ngại rồi tự rút lại (‘we can try our best’), nên team không biết phải làm gì. Hãy kèm một đề xuất cụ thể.' },
          { text: "Too many points, we can't do.", score: 0, note: 'Nghe tiêu cực, thiếu tân ngữ (‘can’t do it’) và không đưa ra giải pháp nào.' },
        ],
      },
    ],
  },
  {
    id: 'clarify-requirement',
    icon: '📧',
    title: 'Làm rõ yêu cầu với khách',
    desc: 'Trao đổi qua email khi yêu cầu của khách hàng nước ngoài còn mơ hồ.',
    steps: [
      {
        speaker: 'Sarah (Client)',
        line: "Hi team, we'd like users to be able to export their reports. Can you add this to the next release?",
        goal: 'Cảm ơn, rồi hỏi khách cần định dạng nào: PDF, Excel hay cả hai.',
        options: [
          { text: 'Hi Sarah, thanks for the request! Which format do you need: PDF, Excel, or both?', score: 2, note: 'Cảm ơn trước, rồi đưa sẵn các lựa chọn để khách trả lời nhanh.' },
          { text: 'What format?', score: 1, note: 'Đúng trọng tâm nhưng quá cụt cho một email gửi khách: thiếu lời chào và ngữ cảnh.' },
          { text: 'Dear Sarah, thank you for your request. We will add the export feature in the next release and choose the best format for you.', score: 0, note: 'Lịch sự nhưng nhận việc khi yêu cầu còn mơ hồ, lại tự chọn định dạng thay khách — rất dễ phải làm lại. Hãy hỏi trước khi code.' },
        ],
      },
      {
        speaker: 'Sarah (Client)',
        line: 'Both, please. And the export should include all the data.',
        goal: 'Hỏi lại "all the data" là mọi cột trong database hay chỉ các cột đang hiển thị trên màn hình.',
        options: [
          { text: 'Got it. Just to clarify: do you mean every column in the database, or only the ones on the screen?', score: 2, note: '‘Just to clarify’ + ‘do you mean A or B?’ — cách hỏi lại vừa lịch sự vừa chính xác.' },
          { text: 'What does "all the data" mean?', score: 1, note: 'Đúng ngữ pháp nhưng hơi cộc, và khách phải tự nghĩ câu trả lời. Nên gợi ý sẵn A hay B.' },
          { text: 'Got it. I think "all the data" means every column in the database, so we will export everything, including the internal fields.', score: 0, note: 'Tự đoán thay khách — đúng điều cần tránh khi yêu cầu còn mơ hồ, và xuất cả cột nội bộ có thể làm lộ dữ liệu.' },
        ],
      },
      {
        speaker: 'Sarah (Client)',
        line: 'Only the columns on the screen. Is that a big change?',
        goal: 'Trả lời: Excel kịp làm trong sprint này, còn PDF cần thêm khoảng 3 ngày vì phải thiết kế bố cục.',
        options: [
          { text: 'Not for Excel: we can deliver it this sprint. PDF will take about three extra days because we need to design the layout.', score: 2, note: 'Tách rõ từng phần, có thời gian và lý do cụ thể, giúp khách dễ ra quyết định.' },
          { text: 'Excel is easy. PDF is more difficult, need more time.', score: 1, note: 'Hiểu được nhưng thiếu chủ ngữ (‘it needs more time’) và không nói cần thêm bao lâu.' },
          { text: 'It depends.', score: 0, note: 'Nói ‘It depends’ mà không nói phụ thuộc vào gì thì khách không biết phải làm gì tiếp.' },
        ],
      },
      {
        speaker: 'Sarah (Client)',
        line: "Great, let's start with Excel and do PDF later.",
        goal: 'Tóm tắt lại thoả thuận bằng văn bản và nhờ khách xác nhận.',
        options: [
          { text: "Sounds good. To summarize: this sprint we'll add Excel export for the columns shown on the screen, and PDF export will follow next sprint. Could you confirm this is correct?", score: 2, note: 'Tóm tắt bằng văn bản rồi xin xác nhận giúp tránh hiểu lầm về sau — thói quen được khách nước ngoài đánh giá rất cao.' },
          { text: 'OK. Excel this sprint, PDF next sprint.', score: 1, note: 'Đủ ý nhưng giống ghi chú cá nhân; với khách nên viết câu hoàn chỉnh và xin xác nhận.' },
          { text: 'OK, please confirm me.', score: 0, note: '‘confirm’ không nhận người làm tân ngữ: nói ‘Could you confirm this?’. Và chưa tóm tắt thì khách không biết xác nhận điều gì.' },
        ],
      },
    ],
  },
  {
    id: 'bug-triage',
    icon: '🐞',
    title: 'Xử lý bug cùng QA',
    desc: 'Trao đổi với tester về một bug mới trên Jira, từ lúc nhận tới lúc test lại.',
    steps: [
      {
        speaker: 'Jake (QA Engineer)',
        line: 'Hey, I just filed a bug: the checkout button does nothing on Safari. Can you take a look?',
        goal: 'Nhận việc, hỏi phiên bản Safari và nhờ ghi các bước tái hiện vào ticket.',
        options: [
          { text: 'Sure! Which Safari version are you on? And could you add repro steps to the ticket?', score: 2, note: 'Nhận việc ngay và hỏi đúng thông tin cần để tái hiện bug. ‘repro steps’ = steps to reproduce.' },
          { text: 'OK. Steps?', score: 1, note: 'Hiểu được nhưng cộc lốc, nghe thiếu thân thiện.' },
          { text: "Hmm, it works on my machine with Chrome, so maybe it's your browser cache. Can you clear it and try again?", score: 0, note: '‘It works on my machine’ là câu ‘kinh điển’ gây khó chịu: chưa thử trên Safari đã đổ cho cache của QA và gạt bug đi.' },
        ],
      },
      {
        speaker: 'Jake (QA Engineer)',
        line: "It's Safari 17 on macOS. The steps are in the ticket now, and it happens every time.",
        goal: 'Báo đã tái hiện được: Safari đọc định dạng ngày khác Chrome nên bước kiểm tra dữ liệu lỗi mà không báo gì. Bạn đang sửa.',
        options: [
          { text: "Thanks, I can reproduce it. Safari parses the date format differently from Chrome, so the validation fails silently. I'm working on a fix.", score: 2, note: 'Xác nhận tái hiện được, giải thích nguyên nhân ngắn gọn và nói bước tiếp theo.' },
          { text: "Yes, I reproduced. It's because of the date.", score: 1, note: 'Thiếu tân ngữ (‘reproduced it’) và giải thích quá mơ hồ.' },
          { text: 'Safari is bad browser, users should use Chrome.', score: 0, note: 'Đổ lỗi cho trình duyệt không giải quyết được vấn đề của người dùng — và thiếu mạo từ: ‘a bad browser’.' },
        ],
      },
      {
        speaker: 'Jake (QA Engineer)',
        line: 'Got it. What priority should we set? The release is on Thursday.',
        goal: 'Đề xuất mức ưu tiên cao, thậm chí chặn release, vì người dùng Safari hoàn toàn không thanh toán được.',
        options: [
          { text: "I'd say high, maybe even a release blocker. Safari users can't pay at all.", score: 2, note: 'Đưa ra mức ưu tiên kèm lý do dựa trên ảnh hưởng tới người dùng — đúng cách triage bug.' },
          { text: "I think maybe it's quite important, but I'm not sure. You and the PM can decide, either way is fine with me.", score: 1, note: 'Đúng ngữ pháp nhưng vòng vo và đẩy quyết định cho người khác; bạn là người hiểu bug rõ nhất, hãy đưa ra mức ưu tiên kèm lý do.' },
          { text: 'Low, I think. Not many of our users use Safari, so we can fix it in the next release.', score: 0, note: 'Đánh giá thấp khi chưa có số liệu, trong khi đây là luồng thanh toán ảnh hưởng trực tiếp tới doanh thu.' },
        ],
      },
      {
        speaker: 'Jake (QA Engineer)',
        line: "Agreed. Ping me when the fix is on staging and I'll retest.",
        goal: 'Báo bản sửa đã lên staging, nhờ test lại trên Safari và kiểm tra nhanh cả Chrome để chắc không có lỗi hồi quy.',
        options: [
          { text: 'The fix is on staging. Could you retest on Safari and quickly check Chrome for regressions?', score: 2, note: 'Thông báo rõ môi trường, nhờ test lại với phạm vi cụ thể và nhắc kiểm tra regression.' },
          { text: 'I fixed already and deployed to staging, please test again on Safari and Chrome for me to make sure no regression.', score: 1, note: 'Đủ ý nhưng thiếu tân ngữ (‘I fixed it’), thiếu động từ (‘make sure there’s no regression’), và ‘please test again for me’ là kiểu dịch từng chữ; tự nhiên hơn: ‘Could you retest it?’' },
          { text: "I fixed it, so you don't need to test.", score: 0, note: 'Dev đã sửa không có nghĩa là bỏ qua bước QA kiểm tra lại.' },
        ],
      },
    ],
  },
  {
    id: 'ask-for-help',
    icon: '🙋',
    title: 'Nhờ tech lead hỗ trợ',
    desc: 'Bị kẹt với một bug khó và cần nhờ người có kinh nghiệm giúp một tay.',
    steps: [
      {
        speaker: 'David (Tech Lead)',
        line: "Hey Minh, I saw your message. What's up?",
        goal: 'Nói rằng bạn bị kẹt với lỗi rò rỉ bộ nhớ trong image service cả buổi sáng và xin anh ấy 15 phút.',
        options: [
          { text: "I've been stuck on a memory leak in the image service all morning. Do you have 15 minutes?", score: 2, note: '‘I’ve been stuck… all morning’ nói rõ vấn đề và thời gian đã bỏ ra; xin thời gian cụ thể là tôn trọng lịch của người khác.' },
          { text: 'I have a problem. Can you help me?', score: 1, note: 'Đúng ngữ pháp nhưng mơ hồ: vấn đề gì, cần giúp bao lâu?' },
          { text: "Sorry for disturbing you. I'm stucking with a memory leak in the image service since morning. Can you spend 15 minutes for me?", score: 0, note: '‘stuck’ là tính từ: không có ‘stucking’. Đi với ‘since’ thì nói ‘I’ve been stuck… since this morning’. Còn ‘spend 15 minutes for me’ là dịch từng chữ, nói ‘Do you have 15 minutes?’' },
        ],
      },
      {
        speaker: 'David (Tech Lead)',
        line: 'Sure. What have you tried so far?',
        goal: 'Kể rằng bạn đã chụp hai heap snapshot để so sánh: số object Buffer tăng liên tục nhưng chưa tìm ra chỗ nào giữ chúng.',
        options: [
          { text: "I took two heap snapshots and compared them. The number of Buffer objects keeps growing, but I haven't found what's holding on to them.", score: 2, note: 'Kể cụ thể đã thử gì và kết quả ra sao, để người giúp không phải hỏi lại từ đầu.' },
          { text: 'I tried many ways but it still not work.', score: 1, note: 'Thiếu trợ động từ (‘it still doesn’t work’) và không nói đã thử những gì.' },
          { text: 'Everything. Nothing works.', score: 0, note: 'Nghe bực bội và không cho người giúp chút thông tin nào để bắt đầu.' },
        ],
      },
      {
        speaker: 'David (Tech Lead)',
        line: 'I think the event listeners are never removed. Try cleaning them up when the request finishes.',
        goal: 'Bạn chưa chắc nên gỡ listener ở chỗ nào, muốn hỏi lại cho chắc.',
        options: [
          { text: 'Should I remove them in the finally block, or when the stream closes?', score: 2, note: 'Hỏi lại bằng câu A hay B: ngắn gọn, cho thấy bạn đã suy nghĩ trước, và người kia trả lời được ngay.' },
          { text: "Sorry, I don't really understand. Can you say again and explain more clearly for me?", score: 1, note: 'Lịch sự nhưng chung chung và thiếu tân ngữ (‘say that again’); người kia không biết bạn chưa hiểu chỗ nào. Hỏi cụ thể sẽ tốt hơn.' },
          { text: 'Yes, yes, I understand everything, thank you. I will clean them up somewhere when the request finishes.', score: 0, note: 'Giả vờ hiểu (‘somewhere’ cho thấy bạn chưa biết gỡ ở đâu) để rồi lại kẹt tiếp, tốn thời gian của cả hai. Chưa hiểu thì cứ hỏi lại.' },
        ],
      },
      {
        speaker: 'David (Tech Lead)',
        line: "Remove them in the stream's 'close' handler. Give it a try and let me know how it goes.",
        goal: 'Cảm ơn, hứa báo lại kết quả, và nói sẽ ghi lại cách xử lý lên wiki cho cả team.',
        options: [
          { text: "Will do, thanks! I'll report back and write it up on the wiki.", score: 2, note: '‘Will do’ = ‘tôi sẽ làm’, cách đáp ngắn gọn tự nhiên. ‘report back’ = báo lại kết quả; chủ động chia sẻ cho team là điểm cộng lớn.' },
          { text: 'Thank you very much for your precious time and your kind support. I will try my best to apply your suggestion.', score: 1, note: 'Lịch sự nhưng quá trang trọng (‘precious time’, ‘kind support’), và chưa hứa báo lại kết quả hay chia sẻ cho team.' },
          { text: "Thanks, but I'm not very familiar with streams. Can you just fix it for me? It's faster.", score: 0, note: 'Đẩy việc ngược lại cho tech lead — vừa thiếu chủ động vừa bỏ lỡ cơ hội học.' },
        ],
      },
    ],
  },
]

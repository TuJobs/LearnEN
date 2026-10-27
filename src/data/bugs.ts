import type { VietglishBug } from '../types'

/** Typical mistakes Vietnamese developers make when writing English at work. */
export const BUGS: VietglishBug[] = [
  {
    wrong: 'Can you check for me this bug?', bug: 'for me', ctx: 'chat',
    fix: 'Can you check this bug for me?',
    why: 'Tân ngữ (this bug) phải đứng ngay sau động từ, ‘for me’ để cuối câu. Dịch thẳng ‘kiểm tra giúp tôi cái bug này’ sẽ sai trật tự.',
  },
  {
    wrong: "I can't login to the admin page.", bug: 'login', ctx: 'chat',
    fix: "I can't log in to the admin page.",
    why: '‘login’ viết liền là danh từ/tính từ (login page). Động từ phải viết rời: ‘log in’. Tương tự: setup/set up, backup/back up, checkout/check out.',
  },
  {
    wrong: 'Please setup the database before running tests.', bug: 'setup', ctx: 'doc',
    fix: 'Please set up the database before running tests.',
    why: 'Động từ là ‘set up’ (viết rời). ‘setup’ viết liền là danh từ: ‘the setup is done’.',
  },
  {
    wrong: 'Please rollback the deployment.', bug: 'rollback', ctx: 'chat',
    fix: 'Please roll back the deployment.',
    why: 'Động từ viết rời ‘roll back’. ‘rollback’ viết liền là danh từ: ‘the rollback took 5 minutes’.',
  },
  {
    wrong: 'I will off tomorrow.', bug: 'will off', ctx: 'chat',
    fix: "I'll be off tomorrow. / I'm taking a day off tomorrow.",
    why: '‘off’ không phải động từ. Dùng ‘be off’, ‘take a day off’, hoặc ‘I’ll be OOO tomorrow’.',
  },
  {
    wrong: 'Please give me some feedbacks.', bug: 'feedbacks', ctx: 'pr',
    fix: 'Please give me some feedback.',
    why: '‘feedback’ là danh từ không đếm được: không thêm -s, không dùng ‘a feedback’.',
  },
  {
    wrong: 'We have many informations about the issue.', bug: 'many informations', ctx: 'meeting',
    fix: 'We have a lot of information about the issue.',
    why: '‘information’ không đếm được: không thêm -s, dùng ‘much / a lot of’. Tương tự: advice, equipment, software, hardware.',
  },
  {
    wrong: 'This function return null when the list is empty.', bug: 'return', ctx: 'pr',
    fix: 'This function returns null when the list is empty.',
    why: 'Chủ ngữ số ít (this function) ở thì hiện tại đơn → động từ thêm -s: returns.',
  },
  {
    wrong: 'Make sure it work before you push.', bug: 'work', ctx: 'pr',
    fix: 'Make sure it works before you push.',
    why: '‘it’ là ngôi thứ ba số ít → ‘works’.',
  },
  {
    wrong: "It's depend on the config.", bug: "It's depend", ctx: 'chat',
    fix: 'It depends on the config.',
    why: '‘depend’ là động từ thường, không đi với ‘is’. Nói ‘It depends on…’.',
  },
  {
    wrong: "I'm agree with your suggestion.", bug: "I'm agree", ctx: 'pr',
    fix: 'I agree with your suggestion.',
    why: '‘agree’ là động từ, không dùng với ‘am’. Nói ‘I agree’.',
  },
  {
    wrong: "I'm not understand the requirement.", bug: "I'm not understand", ctx: 'meeting',
    fix: "I don't understand the requirement.",
    why: 'Phủ định động từ thường dùng do/does + not, không dùng ‘am not’.',
  },
  {
    wrong: 'This feature is not work on Safari.', bug: 'is not work', ctx: 'chat',
    fix: "This feature doesn't work on Safari.",
    why: 'Phủ định động từ ‘work’ ở hiện tại đơn → ‘doesn’t work’.',
  },
  {
    wrong: "Let's discuss about the solution tomorrow.", bug: 'about', ctx: 'meeting',
    fix: "Let's discuss the solution tomorrow.",
    why: '‘discuss’ đã bao hàm nghĩa ‘bàn về’ → không thêm ‘about’. (Nhưng ‘talk about’ thì đúng.)',
  },
  {
    wrong: 'I have fixed this bug yesterday.', bug: 'have fixed', ctx: 'meeting',
    fix: 'I fixed this bug yesterday.',
    why: 'Có mốc thời gian quá khứ cụ thể (yesterday) → dùng quá khứ đơn, không dùng hiện tại hoàn thành.',
  },
  {
    wrong: 'I fixed many bug yesterday.', bug: 'bug', ctx: 'meeting',
    fix: 'I fixed many bugs yesterday.',
    why: '‘many’ đi với danh từ đếm được số nhiều: bugs.',
  },
  {
    wrong: 'We will deploy on production tonight.', bug: 'on', ctx: 'chat',
    fix: 'We will deploy to production tonight.',
    why: 'deploy TO + môi trường đích. Còn ‘the bug happens ON production’ (xảy ra trên) thì đúng.',
  },
  {
    wrong: 'Let me explain you how it works.', bug: 'explain you', ctx: 'meeting',
    fix: 'Let me explain how it works.',
    why: '‘explain’ không nhận người làm tân ngữ trực tiếp: explain something TO someone.',
  },
  {
    wrong: "I'm boring with this task.", bug: 'boring', ctx: 'chat',
    fix: "I'm bored with this task.",
    why: '-ed tả cảm xúc của người (bored = chán). -ing tả tính chất (a boring task). ‘I’m boring’ = ‘Tôi là người nhàm chán’ 😅',
  },
  {
    wrong: 'Sorry for late reply.', bug: 'for late', ctx: 'chat',
    fix: 'Sorry for the late reply.',
    why: 'Cần mạo từ ‘the’ trước danh từ xác định: ‘the late reply’.',
  },
  {
    wrong: 'Please inform me if any problem.', bug: 'if any problem', ctx: 'chat',
    fix: 'Please let me know if there are any problems.',
    why: 'Mệnh đề sau ‘if’ thiếu động từ. Trong chat, ‘let me know’ tự nhiên hơn ‘inform me’.',
  },
  {
    wrong: 'Today I will research about Redis caching.', bug: 'research about', ctx: 'meeting',
    fix: 'Today I will look into Redis caching.',
    why: '‘research’ không cần ‘about’ (research something). Trong stand-up, ‘look into’ nghe tự nhiên hơn.',
  },
  {
    wrong: 'Could you explain more detail?', bug: 'more detail', ctx: 'chat',
    fix: 'Could you explain in more detail?',
    why: 'Thiếu giới từ: ‘in more detail’ = chi tiết hơn.',
  },
  {
    wrong: 'I very like this framework.', bug: 'very like', ctx: 'chat',
    fix: 'I really like this framework.',
    why: '‘very’ không bổ nghĩa cho động từ. Dùng ‘really like’ hoặc ‘like … very much’.',
  },
  {
    wrong: 'The server is die.', bug: 'is die', ctx: 'chat',
    fix: 'The server is down.',
    why: '‘die’ là động từ. Server thì ‘is down’ hoặc ‘has crashed’; app thì ‘crashed’.',
  },
  {
    wrong: 'I recommend you to use TypeScript.', bug: 'you to use', ctx: 'pr',
    fix: 'I recommend using TypeScript.',
    why: '‘recommend’ không đi với cấu trúc ‘someone to do’. Dùng ‘recommend using X’ hoặc ‘recommend that you use X’.',
  },
  {
    wrong: 'I suggest to use a queue here.', bug: 'suggest to use', ctx: 'pr',
    fix: 'I suggest using a queue here.',
    why: '‘suggest’ + V-ing (hoặc ‘suggest that we use…’), không dùng ‘suggest to do’.',
  },
  {
    wrong: 'Do you have any question?', bug: 'question', ctx: 'meeting',
    fix: 'Do you have any questions?',
    why: 'Trong câu hỏi, ‘any’ + danh từ đếm được dùng số nhiều: questions.',
  },
  {
    wrong: 'I will reply you later.', bug: 'reply you', ctx: 'chat',
    fix: 'I will reply to you later.',
    why: '‘reply’ cần giới từ: reply TO someone.',
  },
  {
    wrong: "I'm waiting the CI to finish.", bug: 'waiting the', ctx: 'chat',
    fix: "I'm waiting for the CI to finish.",
    why: '‘wait’ cần giới từ: wait FOR something.',
  },
  {
    wrong: 'The API response very slow.', bug: 'response very slow', ctx: 'chat',
    fix: 'The API responds very slowly.',
    why: '‘response’ là danh từ; động từ là ‘respond(s)’. Bổ nghĩa cho động từ phải dùng trạng từ ‘slowly’.',
  },
  {
    wrong: 'Me and him will handle the migration.', bug: 'Me and him', ctx: 'meeting',
    fix: 'He and I will handle the migration.',
    why: 'Làm chủ ngữ phải dùng đại từ chủ ngữ (He, I), và lịch sự thì đặt ‘I’ sau cùng.',
  },
  {
    wrong: 'The code has a lot of bugs need to fix.', bug: 'need to fix', ctx: 'meeting',
    fix: 'The code has a lot of bugs that need to be fixed.',
    why: 'Thiếu ‘that’ nối mệnh đề, và bug ‘được sửa’ nên dùng bị động: need to be fixed.',
  },
  {
    wrong: 'This bug is very easy to fix it.', bug: 'it.', ctx: 'pr',
    fix: 'This bug is very easy to fix.',
    why: '‘this bug’ đã là đối tượng của ‘fix’ → không lặp lại ‘it’.',
  },
  {
    wrong: "I'm done the task.", bug: 'done the', ctx: 'chat',
    fix: "I'm done with the task. / I've finished the task.",
    why: '‘be done’ cần giới từ ‘with’. Hoặc dùng ‘I’ve finished…’.',
  },
  {
    wrong: "I can't access to the staging server.", bug: 'access to', ctx: 'chat',
    fix: "I can't access the staging server.",
    why: 'Động từ ‘access’ nhận tân ngữ trực tiếp: access something. Chỉ danh từ mới đi với ‘to’: ‘I don’t have access to the server.’',
  },
  {
    wrong: 'Although the API is slow, but it still works.', bug: 'but', ctx: 'meeting',
    fix: 'Although the API is slow, it still works.',
    why: 'Tiếng Anh không dùng cặp ‘although … but’ như ‘tuy… nhưng…’. Chỉ giữ một: ‘Although X, Y’ hoặc ‘X, but Y’. Tương tự, không dùng cặp ‘because … so’.',
  },
  {
    wrong: "I'm looking forward to hear from you.", bug: 'to hear', ctx: 'doc',
    fix: "I'm looking forward to hearing from you.",
    why: 'Trong ‘look forward to’, ‘to’ là giới từ nên theo sau là V-ing hoặc danh từ, không phải động từ nguyên mẫu.',
  },
  {
    wrong: 'Please check the attach file.', bug: 'attach file', ctx: 'doc',
    fix: 'Please check the attached file.',
    why: '‘attach’ là động từ. ‘File được đính kèm’ phải dùng tính từ ‘attached’: ‘the attached file’, hoặc ‘Please find the file attached.’',
  },
  {
    wrong: "Let's me check the logs first.", bug: "Let's me", ctx: 'chat',
    fix: 'Let me check the logs first.',
    why: '‘Let’s’ = ‘Let us’ (rủ cả nhóm cùng làm), nên ‘Let’s me’ bị thừa đại từ. Muốn nói ‘để tôi…’ thì dùng ‘Let me…’.',
  },
  {
    wrong: "I'm working on this bug since yesterday.", bug: "I'm working", ctx: 'meeting',
    fix: "I've been working on this bug since yesterday.",
    why: 'Việc bắt đầu từ quá khứ và vẫn đang tiếp diễn, đi với ‘since/for’ → dùng hiện tại hoàn thành tiếp diễn (have been + V-ing), không dùng hiện tại tiếp diễn.',
  },
  {
    wrong: 'I will send you the report until Friday.', bug: 'until', ctx: 'chat',
    fix: 'I will send you the report by Friday.',
    why: '‘by Friday’ = chậm nhất là thứ Sáu (hạn chót cho một việc). ‘until’ chỉ trạng thái kéo dài liên tục tới mốc đó: ‘I’ll be OOO until Friday.’',
  },
  {
    wrong: 'The demo is on next Monday.', bug: 'on next', ctx: 'meeting',
    fix: 'The demo is next Monday.',
    why: 'Trước next/last/this/every không dùng giới từ chỉ thời gian: ‘next Monday’, ‘last week’. Còn ‘on Monday’ thì đúng.',
  },
  {
    wrong: 'This bug is only happened on iOS.', bug: 'is only happened', ctx: 'chat',
    fix: 'This bug only happens on iOS.',
    why: '‘happen’ là nội động từ nên không có dạng bị động: nói ‘it happens / it happened’, không nói ‘is happened’. Tương tự: occur, appear.',
  },
  {
    wrong: "I didn't received your email.", bug: "didn't received", ctx: 'chat',
    fix: "I didn't receive your email.",
    why: 'Sau ‘did/didn’t’, động từ ở dạng nguyên mẫu vì ‘did’ đã thể hiện thì quá khứ.',
  },
  {
    wrong: 'Everyone have to enable 2FA on their account.', bug: 'Everyone have', ctx: 'doc',
    fix: 'Everyone has to enable 2FA on their account.',
    why: '‘everyone/everybody/each’ là chủ ngữ số ít → ‘has’. (Dùng ‘their’ sau ‘everyone’ thì vẫn đúng.)',
  },
  {
    wrong: "I've updated my codes based on your comments.", bug: 'codes', ctx: 'pr',
    fix: "I've updated my code based on your comments.",
    why: '‘code’ (mã nguồn) là danh từ không đếm được → không thêm -s. ‘codes’ chỉ dùng cho các mã riêng lẻ: error codes, discount codes.',
  },
  {
    wrong: 'Would you mind to add a test for this case?', bug: 'mind to add', ctx: 'pr',
    fix: 'Would you mind adding a test for this case?',
    why: '‘mind’ + V-ing. Lưu ý khi trả lời: ‘No, not at all’ nghĩa là ‘không phiền, được thôi’.',
  },
  {
    wrong: 'We apologize for the inconvenient.', bug: 'inconvenient', ctx: 'doc',
    fix: 'We apologize for the inconvenience.',
    why: 'Sau ‘the’ cần danh từ ‘inconvenience’ (sự bất tiện). ‘inconvenient’ là tính từ (bất tiện).',
  },
  {
    wrong: "I'd like to inform that the server will be down tonight.", bug: 'inform that', ctx: 'doc',
    fix: "I'd like to inform you that the server will be down tonight.",
    why: '‘inform’ bắt buộc có người nhận tin: inform someone (that/of/about…). Thân mật hơn thì dùng ‘let you know that…’.',
  },
]

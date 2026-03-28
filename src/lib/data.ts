export type ExploreItem = {
  id: string
  author: string
  title: string
  subtitle: string
  image: string
  imageHeight: number
  content: string
}
export const exploreItems: ExploreItem[] = [
  {
    id: '1',
    author: 'Kenny做产品',
    title: '我开发的 APP，坚持零广告',
    subtitle: '收藏 65',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    imageHeight: 420,
    content:
      '作为一个独立开发者，我发现自己越来越抗拒在产品里塞满打断体验的广告位。用户点开一个工具，不是为了被拦住，而是为了尽快完成手上的目标。于是我开始反过来要求自己，功能必须足够有价值，才配让用户留下来。' +
      ' 我把每一个交互都当成一次承诺，能少一步就少一步，能不打扰就不打扰。也正因为这样，产品虽然慢一点长大，但它积累下来的每一位用户都更愿意长期使用。' +
      ' 我后来越来越确定，克制本身也是一种设计能力。真正打动人的，往往不是“加了什么”，而是你敢不敢删掉那些会破坏体验的东西。',
  },
  {
    id: '2',
    author: '山里公主',
    title: '怎么，连大学生妹妹这还差不多嘛',
    subtitle: '评论 1411',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    imageHeight: 320,
    content:
      '很多内容爆火，看起来像是一个瞬间，其实背后都是节奏感、镜头语言和情绪铺垫的结果。真正让人停留的，不只是画面够不够漂亮，而是它有没有在第一秒就建立情绪。' +
      ' 我越来越喜欢那种先给你一个轻松入口，再慢慢把故事推近的表达方式。它不会硬拽你，却会让你自己想继续看下去。',
  },
  {
    id: '3',
    author: '一只羊',
    title: '小段牙齿是会发光吗，镜头一推近就沦陷了',
    subtitle: '点赞 5277',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    imageHeight: 520,
    content:
      '氛围感内容最难的不是“拍得美”，而是让观众觉得这个瞬间是真的。背景、构图、光线都只是辅助，真正决定观感的，是人物有没有把情绪站稳。' +
      ' 一旦那个情绪是真的，哪怕只是一个普通镜头，也会让人反复回看。',
  },
  {
    id: '4',
    author: '电影碎片局',
    title: '研究表明：睡前阅读与睡前刷剧，大脑发生巨大差异',
    subtitle: '收藏 2.1w',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    imageHeight: 460,
    content:
      '输入方式会重塑人的注意力。阅读要求大脑主动组织信息，而短视频更像是被动接收连续刺激。它们没有绝对高下，但确实会把你的节奏往不同方向推。' +
      ' 如果你想让自己在晚上慢下来，给第二天留一点清醒的余地，那么睡前那二十分钟到底喂给大脑什么，会比想象中更重要。',
  },
  {
    id: '5',
    author: 'Olivia',
    title: '真笑死了，有那么夸张吗，但是你别说还挺有代入感',
    subtitle: '评论 903',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    imageHeight: 360,
    content:
      '很多好内容都不是靠信息密度取胜，而是靠一种“被懂得了”的感觉取胜。你看到一句话、一个表情、一个停顿，突然觉得它精准地戳中了你的处境，于是你会自然停下来。' +
      ' 这种共鸣很难伪造，所以越是轻描淡写，越容易打中人。',
  },
  {
    id: '6',
    author: '玩车小辣',
    title: '早餐盘看着普通，为什么镜头里反而更有食欲',
    subtitle: '点赞 3812',
    image:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80',
    imageHeight: 300,
    content:
      '食物内容最打动人的，不是堆得多丰盛，而是质感是否真实。边缘的酥脆、蛋液的流动、瓷盘和木桌之间的反差，都会把味觉想象一点点唤起来。' +
      ' 所以好的镜头从来不只是记录食物，而是在替观众预演一口咬下去的感觉。',
  },
]

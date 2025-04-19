export const roles = {
  MemberUser: 'memberUser',
  Marketer: 'marketer',
  Subscriber: 'subscriber',
  MarketerConsultant : 'marketerConsultant'
}

export type UserRoleType =  'subscriber' | 'marketer' | 'memberUser' | 'marketerConsultant'

export const tokens = {
}

export const sorts = [
  {
    name: '',
    value: 1,
  },
]

export const ratingStatus = ['', 'خیلی بد', 'بد', 'معمولی', 'خوب', 'عالی']

export const customeBlurDataURL =
  'data:image/webp;base64,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bPgnEvY7bliCVg6/ULDjbuxWg14uf6/TloHyXrFRTMR/jS123fNOeWjm669d2HfT9ylDN+e/lbD1eZc6KSf0v1Sw+Z73yEI72z/Uafdg2g5F6OfwZ9jiAKb9qdDQ9a94HMGLN4dJRRn+GxmH0LS9uaCj/Z9oOId5ZxK0dP4DbA4CPG9LhZqm8e88jqLtm8JGT8H9s4TDSGVPLmjq9I8azmPckQRd3f8JmwMBN7ajQllb/hcXjiTVzWCjrRD/QcKpTHvhoK/rf9ZwLj1vRITCNvxfmYMBO7ahQGX7/wpHk+omDNJZKAcGSFvAFkqbxomB5w0IUNvXkYEdy5ehuPORAdXFa1Dd/cgAeenY6C53aBBWzkF5p0MDx8sWoL77oYHpi5ahv+2pAZUla9Dg8dQAacEGqTC0YwPPq8UWOtzwsYHjxfLQ4uHcwPSlStDj9dyAykIVKHLD5wZIy9Sgyv3JQVikQboM5eTA8QqxhTInPjkwfYEuqHN/dEB1eSIUejk6QF6cBI1OfHaQliZDp/vDA78wFVo9Hx44XpVOao348MD0NRkGev06PaC2Imyh2fPpAcp6sINqp3F8kFaDHZT7dX4QFuOCes/nBxevhId+p3F+YMc6BGj46wDB9FUI0PE5gUB1DSKUPGUQkFcg4lsxPV/E12J4uojvRcePFvDFaMeDBXwzmv5YAV+NVB/K48MxPxE7fDrG52GLj8fwNN3g89HxozTCB6QdD1IIn5CmPUbCVySVh/D4kMxPwA6fkmF+zeBj8uLJZXxP2jEzDviiNH1e3eKbksqsMr4r05TY48vS83yKwbelHZNhj89L06ZSCF+YeR7s8ZHpeQ6cCJ+Zts+gGHxq5p9rDl+bbvxU8/jgpPQ79cJHpym/USw+PE0cf20kg69PV/jvcL7wCUqh8F/gEggfoi61f1OTw/coXTE3/n/jmqPDl6lxPoSUck4xBu8I/9///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M///M//ExMA'

export const IRAN_PROVINCES = [
  { name: "تهران", bounds: { minLat: 34.8, maxLat: 36.1, minLng: 50.8, maxLng: 52.1 } },
  { name: "اصفهان", bounds: { minLat: 30.8, maxLat: 34.5, minLng: 49.3, maxLng: 55.5 } },
  { name: "خراسان رضوی", bounds: { minLat: 33.5, maxLat: 37.5, minLng: 56.2, maxLng: 61.2 } },
  { name: "فارس", bounds: { minLat: 27.0, maxLat: 31.7, minLng: 50.5, maxLng: 55.5 } },
  { name: "خوزستان", bounds: { minLat: 29.9, maxLat: 33.0, minLng: 47.4, maxLng: 50.4 } },
  { name: "آذربایجان شرقی", bounds: { minLat: 36.7, maxLat: 39.2, minLng: 45.0, maxLng: 48.5 } },
  { name: "مازندران", bounds: { minLat: 35.9, maxLat: 36.9, minLng: 50.1, maxLng: 54.1 } },
  { name: "کرمان", bounds: { minLat: 26.4, maxLat: 32.3, minLng: 54.2, maxLng: 59.5 } },
  { name: "آذربایجان غربی", bounds: { minLat: 35.9, maxLat: 39.5, minLng: 44.0, maxLng: 47.3 } },
  { name: "گیلان", bounds: { minLat: 36.5, maxLat: 38.5, minLng: 48.5, maxLng: 50.6 } },
  { name: "البرز", bounds: { minLat: 35.6, maxLat: 36.4, minLng: 50.3, maxLng: 51.5 } },
  { name: "کرمانشاه", bounds: { minLat: 33.7, maxLat: 35.3, minLng: 45.5, maxLng: 48.1 } },
  { name: "گلستان", bounds: { minLat: 36.5, maxLat: 38.2, minLng: 53.8, maxLng: 56.3 } },
  { name: "قم", bounds: { minLat: 34.1, maxLat: 35.3, minLng: 50.3, maxLng: 51.6 } },
  { name: "سیستان و بلوچستان", bounds: { minLat: 25.0, maxLat: 31.5, minLng: 58.5, maxLng: 63.3 } },
  { name: "مرکزی", bounds: { minLat: 33.5, maxLat: 35.7, minLng: 48.8, maxLng: 51.0 } },
  { name: "اردبیل", bounds: { minLat: 37.2, maxLat: 39.8, minLng: 47.0, maxLng: 48.9 } },
  { name: "همدان", bounds: { minLat: 34.3, maxLat: 35.7, minLng: 47.7, maxLng: 49.4 } },
  { name: "کردستان", bounds: { minLat: 34.7, maxLat: 36.5, minLng: 45.5, maxLng: 48.5 } },
  { name: "قزوین", bounds: { minLat: 35.5, maxLat: 36.8, minLng: 48.7, maxLng: 50.7 } },
  { name: "لرستان", bounds: { minLat: 32.6, maxLat: 34.4, minLng: 46.5, maxLng: 50.3 } },
  { name: "بوشهر", bounds: { minLat: 27.2, maxLat: 30.3, minLng: 50.1, maxLng: 52.8 } },
  { name: "زنجان", bounds: { minLat: 35.5, maxLat: 37.2, minLng: 47.2, maxLng: 49.5 } },
  { name: "سمنان", bounds: { minLat: 34.5, maxLat: 37.5, minLng: 51.8, maxLng: 57.1 } },
  { name: "یزد", bounds: { minLat: 29.8, maxLat: 33.5, minLng: 52.8, maxLng: 56.7 } },
  { name: "هرمزگان", bounds: { minLat: 25.4, maxLat: 28.9, minLng: 52.6, maxLng: 59.2 } },
  { name: "چهارمحال و بختیاری", bounds: { minLat: 31.2, maxLat: 32.7, minLng: 49.3, maxLng: 51.5 } },
  { name: "خراسان جنوبی", bounds: { minLat: 30.5, maxLat: 34.7, minLng: 57.0, maxLng: 60.7 } },
  { name: "خراسان شمالی", bounds: { minLat: 36.3, maxLat: 38.2, minLng: 55.5, maxLng: 58.5 } },
  { name: "ایلام", bounds: { minLat: 32.0, maxLat: 34.1, minLng: 45.5, maxLng: 48.0 } },
  { name: "کهگیلویه و بویراحمد", bounds: { minLat: 30.0, maxLat: 31.5, minLng: 49.9, maxLng: 51.7 } }
];

export const iranProvincesByPopulation = [
  { province: 'تهران', population: 13900000, geom: { coordinates: [51.389, 35.6892] } },
  { province: 'خراسان رضوی', population: 6450000, geom: { coordinates: [59.568, 36.297] } },
  { province: 'اصفهان', population: 5120000, geom: { coordinates: [51.6776, 32.6572] } },
  { province: 'فارس', population: 4850000, geom: { coordinates: [52.5319, 29.5918] } },
  { province: 'خوزستان', population: 4710000, geom: { coordinates: [48.6842, 31.3183] } },
  { province: 'آذربایجان شرقی', population: 3900000, geom: { coordinates: [46.2919, 38.08] } },
  { province: 'مازندران', population: 3400000, geom: { coordinates: [52.5319, 36.5658] } },
  { province: 'کرمان', population: 3400000, geom: { coordinates: [57.0788, 30.2839] } },
  { province: 'البرز', population: 3000000, geom: { coordinates: [50.9391, 35.84] } },
  { province: 'آذربایجان غربی', population: 3200000, geom: { coordinates: [45.0725, 37.5527] } },
  { province: 'سیستان و بلوچستان', population: 2800000, geom: { coordinates: [60.8726, 29.4963] } },
  { province: 'گیلان', population: 2500000, geom: { coordinates: [49.5822, 37.2808] } },
  { province: 'کرمانشاه', population: 2000000, geom: { coordinates: [47.0621, 34.3142] } },
  { province: 'گلستان', population: 1900000, geom: { coordinates: [54.4342, 36.8449] } },
  { province: 'لرستان', population: 1800000, geom: { coordinates: [48.3496, 33.4878] } },
  { province: 'همدان', population: 1800000, geom: { coordinates: [48.5126, 34.798] } },
  { province: 'هرمزگان', population: 1800000, geom: { coordinates: [56.2666, 27.1832] } },
  { province: 'کردستان', population: 1600000, geom: { coordinates: [47.0778, 35.3129] } },
  { province: 'مرکزی', population: 1400000, geom: { coordinates: [49.6892, 34.0954] } },
  { province: 'قم', population: 1350000, geom: { coordinates: [50.8764, 34.6416] } },
  { province: 'قزوین', population: 1300000, geom: { coordinates: [50.0039, 36.2658] } },
  { province: 'بوشهر', population: 1200000, geom: { coordinates: [50.8332, 28.9234] } },
  { province: 'یزد', population: 1200000, geom: { coordinates: [54.3675, 31.8974] } },
  { province: 'زنجان', population: 1100000, geom: { coordinates: [48.4787, 36.6765] } },
  { province: 'خراسان شمالی', population: 850000, geom: { coordinates: [57.331, 37.4747] } },
  { province: 'خراسان جنوبی', population: 800000, geom: { coordinates: [59.2168, 32.8656] } },
  { province: 'چهارمحال و بختیاری', population: 950000, geom: { coordinates: [50.8585, 32.3266] } },
  { province: 'سمنان', population: 700000, geom: { coordinates: [54.3639, 35.572] } },
  { province: 'کهگیلویه و بویراحمد', population: 700000, geom: { coordinates: [50.8746, 30.6682] } },
  { province: 'ایلام', population: 600000, geom: { coordinates: [46.4227, 33.6374] } },
]
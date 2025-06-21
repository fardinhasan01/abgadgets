import React from 'react';

const bannerText =
  'প্রোডাক্ট হাতে পেয়ে টাকা দিবেন 💰 | বাংলাদেশের সকল স্থানে ডেলিভারি করা হয় 🚚 | বিশেষ অফার চলমান আছে! | দ্রুত অর্ডার করুন!';

const TopBanner = () => (
  <div className="top-banner-red">
    <div className="banner-overlay"></div>
    <div className="marquee-red">
      {bannerText}
    </div>
  </div>
);

export default TopBanner; 
'use client';
import Header from '../components/header';
import Footer from '../components/footer';
import { BRAND } from '@/lib/constants';

export default function ReturnPolicyClient() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-void pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-display text-3xl md:text-4xl text-white tracking-wider mb-2">
            Return &amp; Refund Policy
          </h1>
          <p className="text-gray-500 text-sm mb-10">Last updated: March 19, 2026</p>

          <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
            {/* Satisfaction */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">Our Commitment</h2>
              <p>
                At {BRAND.name}, we stand behind every product we ship. If something
                arrives damaged, defective, or isn&apos;t what you ordered, we&apos;ll make
                it right.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">Return Eligibility</h2>
              <p className="mb-3">
                You may request a return or exchange within <strong className="text-white">30 days</strong> of
                receiving your order if the item is:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Damaged during shipping</li>
                <li>Defective (misprints, binding issues, missing pages)</li>
                <li>Incorrect item sent</li>
              </ul>
              <p className="mt-3">
                Items must be unused and in original packaging. We may ask for a photo
                of the issue to expedite the process.
              </p>
            </section>

            {/* Non-returnable */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">Non-Returnable Items</h2>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Digital products (Digital Calendar Sync) — all digital sales are final</li>
                <li>Items returned after 30 days</li>
                <li>Items damaged by the customer after delivery</li>
              </ul>
            </section>

            {/* Pre-orders */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">Pre-Order Cancellations</h2>
              <p>
                Pre-orders may be cancelled for a full refund at any time before the
                item ships. Once a pre-order has shipped, the standard return policy
                applies.
              </p>
            </section>

            {/* Process */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">How to Request a Return</h2>
              <p className="mb-3">To start a return or report an issue:</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>
                  Email us at{' '}
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="text-neon-cyan hover:underline"
                  >
                    {BRAND.email}
                  </a>{' '}
                  with your order number and a description of the issue.
                </li>
                <li>Include a photo of the damaged or defective item if applicable.</li>
                <li>
                  We&apos;ll respond within 2 business days with instructions or a
                  resolution.
                </li>
              </ol>
            </section>

            {/* Refunds */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">Refunds</h2>
              <p>
                Once we receive and inspect the returned item (or approve a photo-based
                claim), refunds are processed to the original payment method within
                5–10 business days. Shipping costs are non-refundable unless the return
                is due to our error.
              </p>
            </section>

            {/* Exchanges */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">Exchanges</h2>
              <p>
                If you&apos;d prefer an exchange instead of a refund, let us know in your
                email. We&apos;ll ship the replacement at no additional cost once the
                original item is returned or the issue is verified.
              </p>
            </section>

            {/* Limited editions */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">Limited Edition Items</h2>
              <p>
                Premium Magnetic Edition and Ultimate Collector Bundle are
                limited-quantity items. Exchanges for these products are subject to
                availability. If your limited-edition item is out of stock, we&apos;ll
                issue a full refund instead.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">Questions?</h2>
              <p>
                Reach us at{' '}
                <a
                  href={`mailto:${BRAND.email}`}
                  className="text-neon-cyan hover:underline"
                >
                  {BRAND.email}
                </a>{' '}
                or through our{' '}
                <a href="/contact" className="text-neon-cyan hover:underline">
                  contact page
                </a>
                . We typically respond within 1–2 business days.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

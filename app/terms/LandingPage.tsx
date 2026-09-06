import { AgendaMockup } from './AgendaMockup';
import { BusinessTypes } from './BusinessTypes';
import { Features } from './Features';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { NavBar } from './NavBar';
import { FaqSection } from './FaqSection';
// import { PricingSection } from './PricingSection';
// import { SocialProofSection } from './SocialProofSection';
import { SimpleSteps } from './SimpleSteps';
import { WhatsAppFlow } from './WhatsAppFlow';
import { WhatsAppSection } from './WhatsAppSection';

export default function LandingPage() {
	return (
		<div className="min-h-screen overflow-x-hidden bg-white text-neutral-950">
			<NavBar />
			<main>
				<Hero />
				<AgendaMockup />
				<BusinessTypes />
				<Features />
				<WhatsAppSection />
				<WhatsAppFlow />
				{/* <PricingSection /> */}
				{/* <SocialProofSection /> */}
				<FaqSection />
				<SimpleSteps />
				<FinalCTA />
			</main>
			<Footer />
		</div>
	);
}

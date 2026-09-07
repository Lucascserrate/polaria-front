import { AgendaMockup } from './mockups/AgendaMockup';
import { BusinessTypes } from './sections/BusinessTypes';
import { Features } from './sections/Features';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { NavBar } from './sections/NavBar';
import { FaqSection } from './sections/FaqSection';
import { SimpleSteps } from './sections/SimpleSteps';
import { WhatsAppFlow } from './sections/WhatsAppFlow';
import { WhatsAppSection } from './sections/WhatsAppSection';

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
				<FaqSection />
				<SimpleSteps />
				<FinalCTA />
			</main>
			<Footer />
		</div>
	);
}

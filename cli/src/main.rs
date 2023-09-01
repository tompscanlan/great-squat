#![warn(future_incompatible, rust_2018_compatibility, rust_2018_idioms, unused)]
#![warn(clippy::pedantic)]
#![cfg_attr(feature = "strict", deny(warnings))]

use clap::Parser;

use std::{thread, time, time::Duration};

const DNS_SERVER: &str = "8.8.8.8:53";

const THROTTLE_TIME: Duration = time::Duration::from_millis(200);

/// Simple cli for testing dns lookups
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// Number of entries to try
    #[arg(short, long, default_value_t = 10)]
    count: u8,

    #[arg(short, long, default_value = DNS_SERVER)]
    dns_server: String,

    #[arg(last = true)]
    dns_names: Vec<String>,
}

fn main() {
    // handle args
    let args: Args = Args::parse();
    let _ = args.dns_names.len() >= 1 || panic!("No DNS names provided");
    println!("{:?}", args);

    // create a channel that we'll send domains to look up
    let (mut lookup_tx, lookup_rx) = spmc::channel::<String>();

    // start child to do lookups
    let join_handle = thread::spawn(move || {
        // look up
        while let Result::Ok(domain) = lookup_rx.recv() {
            // child bails on keyword exit
            if domain == "exit" {
                break;
            }
            // todo: rate limit
            thread::sleep(THROTTLE_TIME);

            let resolved = domain_name_resolves(args.dns_server.to_owned(), domain.to_owned());

            if resolved {
                println!("{} resolves", domain)
            }
        }
    });

    // send domains to look up
    for domain in args.dns_names {
        for d in generate_squatter_possibilities(domain) {
            lookup_tx.send(d).unwrap();
        }
    }

    let res = join_handle.join();
    println!("res: {:?}", res);
}

fn generate_squatter_possibilities(domain: String) -> Vec<String> {
    let mut p = Vec::new();

    // add variations
    p.push(format!("a{}", domain));

    p.push(swap(domain.clone(), "a".to_string(), "s".to_string()));
    p.push(swap(domain.clone(), "o".to_string(), "0".to_string()));
   

    // Levenshtein distance
    // soundex?
    //

    p.push("exit".to_owned());
    return p;
}

#[test]
fn test_twistrs() {
    // use twistrs::permutate::Domain;
    // let domain = Domain::new("google.com").unwrap();
    // let permutations = domain.all().unwrap();
    // println!("{:?}", permutations);
}

#[test]
fn test_generate_squatter_possibilities() {
    let p = generate_squatter_possibilities("google.com".to_owned());
    println!("{:?}", p);
    assert!(p.len() > 0)
}

fn swap(domain: String, find: String, replace: String) -> String {
    return domain.replace(&find, &replace);
}

#[test]

fn test_swap() {
    let s = swap("google.com".to_owned(), 'l'.to_string(), '1'.to_string());
    assert_eq!(s, "goog1e.com");
} // fn squat_options(domain: String) -{
  // }

fn domain_name_resolves(server: String, domain: String) -> bool {
    use std::str::FromStr;
    use trust_dns_client::client::{Client, SyncClient};
    use trust_dns_client::op::DnsResponse;
    use trust_dns_client::rr::{DNSClass, Name, Record, RecordType};
    use trust_dns_client::udp::UdpClientConnection;

    let address = server.parse().unwrap();
    let conn = UdpClientConnection::new(address).unwrap();

    // and then create the Client
    let client = SyncClient::new(conn);

    // Specify the name, note the final '.' which specifies it's an FQDN
    let name = Name::from_str(&format!("{}.", domain)).unwrap();

    // NOTE: see 'Setup a connection' example above
    // Send the query and get a message response, see RecordType for all supported options
    let response: DnsResponse = client.query(&name, DNSClass::IN, RecordType::A).unwrap();

    // Messages are the packets sent between client and server in DNS.
    //  there are many fields to a Message, DnsResponse can be dereferenced into
    //  a Message. It's beyond the scope of these examples
    //  to explain all the details of a Message. See trust_dns_client::op::message::Message for more details.
    //  generally we will be interested in the Message::answers
    let answers: &[Record] = response.answers();

    if answers.len() > 0 {
        return answers[0].data().is_some();
    } else {
        return false;
    }
}

#[test]
fn test_good_resolution() {
    assert!(domain_name_resolves(
        DNS_SERVER.to_string(),
        "google.com".to_owned()
    ))
}
#[test]
fn test_does_not_resolve() {
    assert!(
        !domain_name_resolves(
            DNS_SERVER.to_string(),
            "this-name-cant-really-exist.com".to_owned()
        ),
        "this domain should never resolve"
    );
}
